import { api, Stream } from 'misskey-js';
import fetch from 'node-fetch';
import { client as WebSocket } from 'websocket';
import { MessagingMessage } from 'misskey-js/built/entities';

import Adapter, { PostInit } from '../../api/adapter';
import { Nullable } from '../../api/models/nullable';
import { File } from '../../api/models/file';
import { Post } from '../../api/models/post';
import { User } from '../../api/models/user';
import { getConfigAsync, MisskeyAdapterConfig } from './config';
import { Core } from '../../core';
import { convertVisibilityToMisskey } from './util/convert-visibility';
import { convertNote } from './util/convert-note';
import { getId } from '../../api/get-id';
import { convertMessage } from './util/convert-message';
import { convertUser } from './util/convert-user';
import { convertFile } from './util/convert-file';

export default class MisskeyAdapter implements Adapter {
  public get name() { return 'misskey' }

  public constructor(private core: Core) { }

  public async connectAsync(): Promise<void> {
    const {host, token} = this.config = await getConfigAsync();
    this.client = new api.APIClient({
      origin: host,
      credential: token,
      fetch,
    });
    this.stream = new Stream(host, { token }, { WebSocket });

    this.stream.once('_connected_', () => this.core.emit('connected'));
  }

  public async disconnectAsync(): Promise<void> {
    this.stream?.close();
  }

  public async createPostAsync(payload: PostInit): Promise<Post> {
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

  public repostAsync(post: Post | Post['id'], payload?: PostInit): Promise<Post> {
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

  public async replyAsync(post: Post | Post['id'], payload: PostInit): Promise<Post> {
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

  public async sendDirectAsync(user: User | User['id'], init: PostInit): Promise<Post> {
    if (!init.body === null) throw new TypeError('body is null');
    const res: MessagingMessage = await this.client.request('messaging/messages/create', {
      userId: getId(user),
      text: init.body,
    });
    return convertMessage(res, this.config.host);
  }

  public async followAsync(user: User | User['id']): Promise<void> {
    await this.client.request('following/create', { userId: getId(user) });
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
    return convertUser(await this.client.request('i'), this.config.host);
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
}
