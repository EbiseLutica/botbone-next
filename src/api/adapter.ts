import { File } from './models/file';
import { Nullable } from './models/nullable';
import { Post } from './models/post';
import { User } from './models/user';
import { Visibility } from './models/visibility';

export default interface Adapter {
  get name(): string;
  connectAsync(): Promise<void>;
  disconnectAsync(): Promise<void>;

  createPostAsync(payload: PostInit): Promise<Post>;
  deletePostAsync(post: Post | Post['id']): Promise<void>;
  repostAsync(post: Post | Post['id'], payload?: PostInit): Promise<Post>;
  undoRepostAsync(post: Post | Post['id']): Promise<void>;
  likeAsync(post: Post | Post['id']): Promise<void>;
  undoLikeAsync(post: Post | Post['id']): Promise<void>;

  replyAsync(post: Post | Post['id'], payload: PostInit): Promise<Post>;
  reactAsync(post: Post | Post['id'], emoji: string): Promise<void>;
  sendDirectAsync(user: User, init: PostInit): Promise<Post>;

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