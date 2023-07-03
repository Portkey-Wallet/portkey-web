import EventEmitter from 'events';
import * as uuid from 'uuid';

export const eventBus = new EventEmitter();

export const isExtension = () => location.protocol === 'chrome-extension:';

export const randomId = () => uuid.v4().replace(/-/g, '');

export const dealURLLastChar = (url: string) => (url.at(-1) === '/' ? url.slice(0, -1) : url);
