import AElf from 'aelf-sdk';
import { isValidBase58 } from './valid';

export function isAelfAddress(value?: string) {
  if (!value || !isValidBase58(value)) return false;
  if (value.includes('_') && value.split('_').length < 3) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}

export function getEntireDIDAelfAddress(value: string, defaultPrefix = 'ELF', defaultSuffix = 'AELF') {
  const arr = value.split('_');
  if (arr.length > 3 || arr.length === 0) return '';
  if (arr.length === 3) return value;
  if (arr.length === 1) return `${defaultPrefix}_${value}_${defaultSuffix}`;
  // arr.length === 2
  if (isAelfAddress(arr[0])) return `${defaultPrefix}_${value}`;
  return `${value}_${defaultSuffix}`;
}
