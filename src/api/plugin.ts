import { Core } from '../core.js';
import Adapter from './adapter.js';

export type Plugin = (core: Core, adapter: Adapter) => (void | VoidFunction);
