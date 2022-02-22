import { existsConfig, readConfigAsync } from '../../api/config';

const CONFIG_NAME = 'misskey-adapter';

export interface MisskeyAdapterConfig {
  host: string;
  token: string;
}

if (!existsConfig(CONFIG_NAME)) {
  console.error(`Please fill the config at ./config/${CONFIG_NAME}.json`);
  process.exit(0);
}

let config: MisskeyAdapterConfig;


export const getConfigAsync = async () => {
  if (!config) {
    config = await readConfigAsync<MisskeyAdapterConfig>(CONFIG_NAME);
  }
  return config;
};