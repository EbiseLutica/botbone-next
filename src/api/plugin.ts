import { Core } from '../core';

export type Plugin = (core: Core) => (void | VoidFunction);
