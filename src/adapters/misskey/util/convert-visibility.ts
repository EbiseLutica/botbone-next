import { BiMap } from '@jsdsl/bimap';
import { noteVisibilities } from 'misskey-js';
import { Visibility } from '../../../api/models/visibility.js';

const visibilitiesMap = new BiMap<Visibility, typeof noteVisibilities[number]>();

visibilitiesMap.set('public', 'public');
visibilitiesMap.set('insider', 'home');
visibilitiesMap.set('friends', 'followers');
visibilitiesMap.set('direct', 'specified');

export const convertVisibilityToMisskey = (v: Visibility) => visibilitiesMap.getFromKey(v);

export const convertVisibilityFromMisskey = (v: typeof noteVisibilities[number]) => visibilitiesMap.getFromValue(v);
