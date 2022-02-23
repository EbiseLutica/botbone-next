import { Plugin } from '../api/plugin.js';

export const followPlugin: Plugin = (core, adapter) => {
  core.addEventListener('receiveFollow', e => {
    adapter.followAsync(e.value);
  });
};