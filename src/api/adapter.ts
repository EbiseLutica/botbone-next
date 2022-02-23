import { File } from './models/file.js';
import { Nullable } from './models/nullable.js';
import { Post } from './models/post.js';
import { User } from './models/user.js';
import { Visibility } from './models/visibility.js';

export default interface Adapter {
  get name(): string;
  connectAsync(): Promise<void>;
  disconnectAsync(): Promise<void>;

  createPostAsync(payload: PostInit): Promise<Nullable<Post>>;
  deletePostAsync(post: Post | Post['id']): Promise<void>;
  repostAsync(post: Post | Post['id'], payload?: PostInit): Promise<Nullable<Post>>;
  undoRepostAsync(post: Post | Post['id']): Promise<void>;
  likeAsync(post: Post | Post['id']): Promise<void>;
  undoLikeAsync(post: Post | Post['id']): Promise<void>;

  replyAsync(post: Post | Post['id'], payload: PostInit): Promise<Nullable<Post>>;
  reactAsync(post: Post | Post['id'], emoji: string): Promise<void>;
  sendDirectAsync(user: User, init: PostInit): Promise<Nullable<Post>>;

  followAsync(user: User | User['id']): Promise<void>;
  undoFollowAsync(user: User | User['id']): Promise<void>;
  blockAsync(user: User | User['id']): Promise<void>;
  undoBlockAsync(user: User | User['id']): Promise<void>;
  muteAsync(user: User | User['id']): Promise<void>;
  undoMuteAsync(user: User | User['id']): Promise<void>;

  getMyselfAsync(): Promise<User>;
  getPostAsync(id: Post['id']): Promise<Nullable<Post>>;
  getUserAsync(id: User['id']): Promise<Nullable<User>>;
  getFileAsync(id: File['id']): Promise<Nullable<File>>;
}

export interface PostInit {
  summary?: string;
  body?: string;
  attachmentIds?: string[];
  visibility?: Visibility;
  quoteId?: string;
  replyId?: string;
}