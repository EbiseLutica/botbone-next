import { readFileSync } from 'fs';
import MisskeyAdapter from './adapters/misskey/index.js';
import { Core } from './core.js';
import plugins from './plugins/index.js';

const {version} = JSON.parse(readFileSync('./package.json', 'utf-8'));
console.log(`Citrine ver ${version}`);

const core = new Core();

core.addAllPlugins(plugins);

core.startAsync(new MisskeyAdapter(core)).then(() => {
  console.log('起動しました！');
});