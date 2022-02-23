import { User as MiUser } from 'misskey-js/built/entities';
import { User } from '../../../api/models/user.js';

export const convertUser = (u: MiUser, myHost: string): User => {
  const detailed = 'createdAt' in u ? u : undefined;
  return {
    id: u.id,
    displayId: u.username + '@' + (u.host ?? myHost),
    name: u.username,
    createdAt: detailed?.createdAt ? new Date(detailed.createdAt) : undefined,
    profile: {
      avatarUrl: u.avatarUrl,
      headerUrl: detailed?.avatarUrl ?? undefined,
      birthday: detailed?.birthday ? new Date(detailed.birthday) : undefined,
      description: detailed?.description ?? undefined,
      gender: null,
      name: u.name || u.username,
      location: detailed?.location ?? undefined,
    },
    native: u,
  };
}