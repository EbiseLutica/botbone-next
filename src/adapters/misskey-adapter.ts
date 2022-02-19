import { api } from 'misskey-js';
import Adapter, { PostInit } from '../api/adapter';
import { Nullable } from '../api/models/nullable';
import { File } from '../api/models/file';
import { Post } from '../api/models/post';
import { User } from '../api/models/user';

export default class MisskeyAdapter implements Adapter {
  public get name() { return 'misskey' }

  public async connectAsync(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async disconnectAsync(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public createPostAsync(payload: PostInit): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public deletePostAsync(post: Post | Post['id']): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public repostAsync(post: Post | Post['id'], payload?: PostInit): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public undoRepostAsync(post: Post | Post['id']): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public likeAsync(post: Post | Post['id']): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public undoLikeAsync(post: Post | Post['id']): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public replyAsync(post: Post | Post['id'], payload: PostInit): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public reactAsync(post: Post | Post['id'], emoji: string): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public sendDirectAsync(user: User, init: PostInit): Promise<Post> {
    throw new Error('Method not implemented.');
  }

  public followAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public undoFollowAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public blockAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public undoBlockAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public muteAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public undoMuteAsync(user: User | User['id']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public getMyselfAsync(): Promise<User> {
    throw new Error('Method not implemented.');
  }

  public getPostAsync(id: Post['id']): Promise<Nullable<Post>> {
    throw new Error('Method not implemented.');
  }

  public getUserAsync(id: User['id']): Promise<Nullable<User>> {
    throw new Error('Method not implemented.');
  }

  public getFileAsync(id: File['id']): Promise<Nullable<File>> {
    throw new Error('Method not implemented.');
  }

  private client: api.APIClient | null = null;
}
