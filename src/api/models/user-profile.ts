import { Gender } from './gender';

export interface UserProfile {
  name?: string;
  description?: string;
  location?: string;
  gender?: Gender;
  birthday?: Date;
  avatarUrl?: string;
  headerUrl?: string;
}
