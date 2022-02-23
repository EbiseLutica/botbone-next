import { DriveFile as MiFile } from 'misskey-js/built/entities';
import { File } from '../../../api/models/file.js';

export const convertFile = (file: MiFile): File => {
  return {
    id: file.id,
    createdAt: new Date(file.createdAt),
    url: file.url,
    width: (file.properties['width'] as number | undefined),
    height: (file.properties['height'] as number | undefined),
    fileType: file.type,
    fileSize: file.size,
    native: file,
  };
};
