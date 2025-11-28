export * from './config';
export * from './types';
export * from './did';
export * from './wallet';

import { DID } from './did';
export const did = new DID();
