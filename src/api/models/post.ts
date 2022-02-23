import { DataObject } from './data-object.js';
import { File } from './file.js';
import { User } from './user.js';
import { Visibility } from './visibility.js';

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
