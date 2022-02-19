import { DataObject } from './data-object';
import { UserProfile } from './user-profile';
import { Visibility } from './visibility';

export interface User extends DataObject {
  id: string;
  createdAt: Date;
  name: string;
  email?: string;
  profile: UserProfile;
  visibility?: Visibility;
}
