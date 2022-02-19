import { DataObject } from './data-object';


export interface File extends DataObject {
  id: string;
  url: string;
  width?: number;
  height?: number;
  fileType?: string;
  fileSize?: number;
}
