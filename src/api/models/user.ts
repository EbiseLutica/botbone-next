import { DataObject } from './data-object.js';
import { UserProfile } from './user-profile.js';
import { Visibility } from './visibility.js';

export interface User extends DataObject {
  id: string;
  displayId: string;
  name: string;
  createdAt?: Date;
  email?: string;
  profile: UserProfile;
  visibility?: Visibility;
}
