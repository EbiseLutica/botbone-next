import { existsSync, promises as file } from 'fs';
import { AnyRecord } from './models/any-record';

const getConfigPath = (name: string) => `./config/${name}.json`;

export const readConfigAsync = async <T extends AnyRecord = AnyRecord>(name: string, defaultConfig: T) => {
  const path = getConfigPath(name);
  if (!existsSync(path)) return defaultConfig;
 
  return file.readFile(path, {
    encoding: 'utf-8',
    flag: 'r',
  }).then((text) => JSON.parse(text) as T);
};

export const writeConfigAsync = async <T extends Record<string, unknown>>(name: string, data: T) => {
  const path = getConfigPath(name);
  
  file.writeFile(path, JSON.stringify(data), {
    encoding: 'utf-8',
    flag: 'w',
  });
};
