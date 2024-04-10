import { forgeWeb } from '@portkey/utils';
import EventEmitter from 'events';
import * as uuid from 'uuid';

export const eventBus = new EventEmitter();

export const isExtension = () => location.protocol === 'chrome-extension:';

export const randomId = () => uuid.v4().replace(/-/g, '');

export const dealURLLastChar = (url = '') => (url?.slice(-1) === '/' ? url.slice(0, -1) : url);

export const isBrowser = typeof window !== 'undefined';

/**
 * this function is to format address,just like "formatStr2EllipsisStr"  to "for...ess"
 * @param address - address
 * @param digits - [pre_count, suffix_count]
 * @param type - format type
 * @returns string
 */
export const formatStr2EllipsisStr = (address = '', digits = [10, 10], type: 'middle' | 'tail' = 'middle'): string => {
  if (!address) return '';

  const len = address.length;

  if (type === 'tail') return `${address.slice(0, digits[0])}...`;

  if (len < digits[0] + digits[1]) return address;
  const pre = address.substring(0, digits[0]);
  const suffix = address.substring(len - digits[1]);
  return `${pre}...${suffix}`;
};

export function getExploreLink(
  explorerUrl: string,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block' = 'address',
): string {
  const prefix = explorerUrl[explorerUrl.length - 1] !== '/' ? explorerUrl + '/' : explorerUrl;
  switch (type) {
    case 'transaction': {
      return `${prefix}tx/${data}`;
    }
    case 'token': {
      return `${prefix}token/${data}`;
    }
    case 'block': {
      return `${prefix}block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}address/${data}`;
    }
  }
}

export function isEmptyObject(obj: object) {
  if (!obj) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function isEmpty(o: any) {
  if (!o) return true;
  return isEmptyObject(o);
}

export const decodeMessageByRsaKey = async (rsaKey: string, encodeData: string) => {
  const cryptoManager = new forgeWeb.ForgeCryptoManager();
  const decodeResult = await cryptoManager.decryptLong(rsaKey, encodeData);
  console.log('=== decodeMessageByRsaKey decodeResult 1', decodeResult);

  return decodeResult;
};
