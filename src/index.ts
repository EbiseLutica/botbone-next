import MisskeyAdapter from './adapters/misskey/index.js';
import { Core } from './core.js';
import { followPlugin } from './plugins/follow.js';
import { pingPlugin } from './plugins/ping.js';

const core = new Core();

core.addAllPlugins({
  pingPlugin,
  followPlugin,
});

core.startAsync(new MisskeyAdapter(core)).then(() => {
  console.log('起動しました！');
});
