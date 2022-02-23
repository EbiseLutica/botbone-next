import { api, Stream } from 'misskey-js';
import fetch from 'node-fetch';
import WebSocket from 'ws';
import { MessagingMessage, Note as MiNote, User as MiUser } from 'misskey-js/built/entities';

import Adapter, { PostInit } from '../../api/adapter.js';
import { Nullable } from '../../api/models/nullable.js';
import { File } from '../../api/models/file.js';
import { Post } from '../../api/models/post.js';
import { User } from '../../api/models/user.js';
import { getConfigAsync, MisskeyAdapterConfig } from './config.js';
import { Core } from '../../core.js';
import { convertVisibilityToMisskey } from './util/convert-visibility.js';
import { convertNote } from './util/convert-note.js';
import { getId } from '../../api/get-id.js';
import { convertMessage } from './util/convert-message.js';
import { convertUser } from './util/convert-user.js';
import { convertFile } from './util/convert-file.js';

export interface MisskeyAdapterInit {
  observeHomeTimeline?: boolean,
  observeLocalTimeline?: boolean,
  observeHybridTimeline?: boolean,
  observeGlobalTimeline?: boolean,
}

export default class MisskeyAdapter implements Adapter {
  public get name() { return 'misskey' }

  public constructor(private core: Core, private init: MisskeyAdapterInit = {
    observeHomeTimeline: true,
  }) {

  }

  public async connectAsync(): Promise<void> {
    const {host, token} = this.config = await getConfigAsync();
    this.client = new api.APIClient({
      origin: host,
      credential: token,
      fetch,
    });
    this.myself = await this.client.request('i');
    this.stream = new Stream(host, { token }, { WebSocket });

    this.stream.once('_connected_', () => this.core.dispatchEvent('connected', undefined));
    this.stream.once('_disconnected_', () => this.core.dispatchEvent('disconnected', undefined));

    const main = this.stream.useChannel('main');
    main.on('notification', e => {
      switch (e.type) {
      case 'follow': {
        this.core.dispatchEvent('receiveFollow', convertUser(e.user, host));
        break;
      }
      case 'mention': {
        this.core.dispatchEvent('receiveMention', convertNote(e.note, host));
        this.core.dispatchEvent('receiveRequest', convertNote(e.note, host));
        break;
      }
      case 'reply': {
        this.core.dispatchEvent('receiveReply', convertNote(e.note, host));
        this.core.dispatchEvent('receiveRequest', convertNote(e.note, host));
        break;
      }
      case 'pollVote': {
        // TODO 引数を渡す
        this.core.dispatchEvent('receiveVote', null);
        break;
      }
      case 'renote': {
        this.core.dispatchEvent('receiveRepost', convertNote(e.note, host));
        break;
      }
      case 'reaction': {
        this.core.dispatchEvent('receiveReact', null);
        this.core.dispatchEvent('receiveFavorite', convertNote(e.note, host));
        break;
      }
      }
    });
    
    main.on('meUpdated', user => this.myself = user);

    main.on('unfollow', user => {
      this.core.dispatchEvent('receiveUnfollow', convertUser(user, host));
    });
    
    this.stream.on('noteUpdated', async e => {
      const post = await this.getPostAsync(e.id);
      if (!post) return;
      if (e.type === 'deleted') {
        this.core.dispatchEvent('receivePostDelete', post);
      }
    });
    
    main.on('messagingMessage', message => {
      this.core.dispatchEvent('receiveDirect', convertMessage(message, host));
      this.core.dispatchEvent('receiveRequest', convertMessage(message, host));
    });

    const handleNote = (note: MiNote) => {
      this.core.dispatchEvent('receiveTimeline', convertNote(note, host));
      this.stream.send('sn', {id: note.id});
    };

    if (this.init.observeHomeTimeline) this.stream.useChannel('homeTimeline').on('note', handleNote);
    if (this.init.observeLocalTimeline) this.stream.useChannel('localTimeline').on('note', handleNote);
    if (this.init.observeHomeTimeline) this.stream.useChannel('hybridTimeline').on('note', handleNote);
    if (this.init.observeGlobalTimeline) this.stream.useChannel('globalTimeline').on('note', handleNote);
  }

  public async disconnectAsync(): Promise<void> {
    this.stream?.close();
  }

  public async createPostAsync(payload: PostInit): Promise<Nullable<Post>> {
    if (!this.core.dispatchEvent('sendPost', payload)) {
      // TODO logging
      return null;
    }
    const {createdNote} = await this.client.request('notes/create', {
      cw: payload.summary,
      text: payload.body,
      visibility: convertVisibilityToMisskey(payload.visibility ?? 'public'),
      renoteId: payload.quoteId,
      replyId: payload.replyId,
      fileIds: payload.attachmentIds,
    });
    return convertNote(createdNote, this.config.host);
  }

  public async deletePostAsync(post: Post | Post['id']): Promise<void> {
    await this.client.request('notes/delete', {
      noteId: getId(post),
    });
  }

  public repostAsync(post: Post | Post['id'], payload?: PostInit): Promise<Nullable<Post>> {
    return this.createPostAsync({
      ...payload,
      quoteId: getId(post),
    });
  }

  public async undoRepostAsync(post: Post | Post['id']): Promise<void> {
    await this.client.request('notes/unrenote', {
      noteId: getId(post),
    });
  }

  public likeAsync(post: Post | Post['id']): Promise<void> {
    return this.reactAsync(post, '⭐️');
  }

  public async undoLikeAsync(post: Post | Post['id']): Promise<void> {
    await this.client.request('notes/reactions/delete', {
      noteId: getId(post),
    });
  }

  public async replyAsync(post: Post | Post['id'], payload: PostInit): Promise<Nullable<Post>> {
    const postObject = typeof post === 'string' ? await this.getPostAsync(post) : post;
    // 指定したIDがチャット投稿のときnullになるのでなんとかする
    if (!postObject) throw new TypeError();
    // チャット投稿である
    return 'recipientId' in postObject.native ? (
      this.sendDirectAsync(postObject.author, payload)
    ) : (
      // TODO メンションをつける
      this.createPostAsync({ ...payload, replyId: getId(post) })
    );
  }

  public async reactAsync(post: Post | Post['id'], emoji: string): Promise<void> {
    await this.client.request('notes/reactions/create', {
      noteId: getId(post),
      reaction: emoji,
    });
  }

  public async sendDirectAsync(user: User | User['id'], init: PostInit): Promise<Nullable<Post>> {
    if (!init.body === null) throw new TypeError('body is null');
    const res: MessagingMessage = await this.client.request('messaging/messages/create', {
      userId: getId(user),
      text: init.body,
    });
    return convertMessage(res, this.config.host);
  }

  public async followAsync(user: User | User['id']): Promise<void> {
    const u = typeof user === 'object' ? user : await this.getUserAsync(user);
    if (!u) throw new TypeError('no such user');
    if (!this.core.dispatchEvent('sendFollow', u)) {
      // TODO logging
      return;
    }
    await this.client.request('following/create', { userId: u.id });
  }

  public async undoFollowAsync(user: User | User['id']): Promise<void> {
    await this.client.request('following/delete', { userId: getId(user) });
  }

  public async blockAsync(user: User | User['id']): Promise<void> {
    await this.client.request('blocking/create', { userId: getId(user) });
  }

  public async undoBlockAsync(user: User | User['id']): Promise<void> {
    await this.client.request('blocking/delete', { userId: getId(user) });
  }

  public async muteAsync(user: User | User['id']): Promise<void> {
    await this.client.request('mute/create', { userId: getId(user) });
  }

  public async undoMuteAsync(user: User | User['id']): Promise<void> {
    await this.client.request('mute/delete', { userId: getId(user) });
  }

  public async getMyselfAsync(): Promise<User> {
    return convertUser(this.myself, this.config.host);
  }

  public async getPostAsync(noteId: Post['id']): Promise<Nullable<Post>> {
    const note = await this.client.request('notes/show', {noteId}).catch(() => null);
    return note ? convertNote(note, this.config.host) : null;
  }

  public async getUserAsync(userId: User['id']): Promise<Nullable<User>> {
    const user = await this.client.request('users/show', {userId}).catch(() => null);
    return user ? convertUser(user, this.config.host) : null;
  }

  public async getFileAsync(fileId: File['id']): Promise<Nullable<File>> {
    const file = await this.client.request('drive/files/show', {fileId}).catch(() => null);
    return file ? convertFile(file) : null;
  }

  private config: MisskeyAdapterConfig = {
    token: '',
    host: '',
  };
  
  private client: api.APIClient;
  private stream: Stream;
  private myself: MiUser;
}
