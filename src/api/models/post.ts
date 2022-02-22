import { DataObject } from './data-object';
import { File } from './file';
import { User } from './user';
import { Visibility } from './visibility';

export interface Post extends DataObject {
  id: string;
  createdAt?: Date;
  summary?: string;
  body?: string;
  attachments?: File[];
  author: User;
  visibility?: Visibility;
  quote?: Post;
  reply?: Post;
}
