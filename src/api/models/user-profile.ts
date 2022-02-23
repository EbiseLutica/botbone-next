import { Gender } from './gender.js';

export interface UserProfile {
  name?: string;
  description?: string;
  location?: string;
  gender?: Gender;
  birthday?: Date;
  avatarUrl?: string;
  headerUrl?: string;
}
