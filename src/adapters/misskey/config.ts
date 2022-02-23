import { existsConfig, readConfigAsync, writeConfigAsync } from '../../api/config.js';

const CONFIG_NAME = 'misskey-adapter';

export interface MisskeyAdapterConfig {
  host: string;
  token: string;
}

let config: MisskeyAdapterConfig;


export const getConfigAsync = async () => {
  if (!existsConfig(CONFIG_NAME)) {
    await writeConfigAsync(CONFIG_NAME, {
      host: '',
      token: '',
    });
    console.error(`Please fill the config at ./config/${CONFIG_NAME}.json`);
    process.exit(0);
  }
  if (!config) {
    config = await readConfigAsync<MisskeyAdapterConfig>(CONFIG_NAME);
  }
  if (!config.host || !config.token) {
    console.error(`Please fill the config at ./config/${CONFIG_NAME}.json`);
    process.exit(0);
  }
  return config;
};