import { MessagingMessage as MiMessage } from 'misskey-js/built/entities';

import { Post } from '../../../api/models/post'
import { convertFile } from './convert-file';
import { convertUser } from './convert-user';

export const convertMessage = (msg: MiMessage, myHost: string): Post => {
  return {
    id: msg.id,
    createdAt: new Date(msg.createdAt),
    body: msg.text ?? undefined,
    attachments: msg.file ? [convertFile(msg.file)] : [],
    author: convertUser(msg.user, myHost),
    visibility: 'direct',
    native: msg,
  };
}