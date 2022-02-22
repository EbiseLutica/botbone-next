import { DataObject } from './data-object';
import { UserProfile } from './user-profile';
import { Visibility } from './visibility';

export interface User extends DataObject {
  id: string;
  displayId: string;
  name: string;
  createdAt?: Date;
  email?: string;
  profile: UserProfile;
  visibility?: Visibility;
}
