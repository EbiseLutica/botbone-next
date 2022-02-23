import { Plugin } from '../api/plugin.js';

export const pingPlugin: Plugin = (core, adapter) => {
  core.addEventListener('receiveRequest', e => {
    if (e.value.body?.toLowerCase().includes('ping')) {
      adapter.replyAsync(e.value, {
        body: 'PONG!',
      });
    }
  });
};
