import { readFileSync } from 'fs';
import MisskeyAdapter from './adapters/misskey';
import { Core } from './core';
import plugins from './plugins';

const {version} = JSON.parse(readFileSync('./package.json', 'utf-8'));
console.log(`Citrine ver ${version}`);

const core = new Core();

core.startAsync(new MisskeyAdapter(core)).then(() => {
  console.log('起動しました！');
});