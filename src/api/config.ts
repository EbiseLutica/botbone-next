import { existsSync, promises as file } from 'fs';
import { AnyRecord } from './models/any-record';

const getConfigPath = (name: string) => `./config/${name}.json`;

export const readConfigAsync = async <T = AnyRecord>(name: string, defaultConfig?: T): Promise<T> => {
  if (!existsConfig(name)) {
    if (!defaultConfig) throw new Error();
    return defaultConfig;
  }
 
  return file.readFile(getConfigPath(name), {
    encoding: 'utf-8',
    flag: 'r',
  }).then((text) => JSON.parse(text) as T);
};

export const writeConfigAsync = async <T extends Record<string, unknown>>(name: string, data: T): Promise<void> => {
  file.writeFile(getConfigPath(name), JSON.stringify(data), {
    encoding: 'utf-8',
    flag: 'w',
  });
};

export const existsConfig = (name: string): boolean => {
  return existsSync(getConfigPath(name));
}