import { Note as MiNote } from 'misskey-js/built/entities';

import { Post } from '../../../api/models/post'
import { convertVisibilityFromMisskey } from './convert-visibility.js';
import { convertFile } from './convert-file.js';
import { convertUser } from './convert-user.js';

export const convertNote = (note: MiNote, myHost: string): Post => {
  return {
    id: note.id,
    createdAt: new Date(note.createdAt),
    summary: note.cw ?? undefined,
    body: note.text ?? undefined,
    attachments: note.files.map(convertFile),
    author: convertUser(note.user, myHost),
    visibility: convertVisibilityFromMisskey(note.visibility),
    quote: note.renote ? convertNote(note.renote, myHost) : undefined,
    reply: note.reply ? convertNote(note.reply, myHost) : undefined,
    native: note,
  };
}