import { Core } from '../core';
import Adapter from './adapter';

export type Plugin = (core: Core, adapter: Adapter) => (void | VoidFunction);
