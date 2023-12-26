import AElf from 'aelf-sdk';
import { isValidBase58 } from './valid';
import { ChainId, ChainType } from '@portkey-v1/types';
import { getTxResult } from '@portkey-v1/contracts';
import { aelf } from '@portkey-v1/utils';

export function isAelfAddress(value?: string) {
  if (!value || !isValidBase58(value)) return false;
  if (value.includes('_') && value.split('_').length < 3) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}

export const getChainNumber = (chainId: string) => {
  return AElf.utils.chainIdConvertor.base58ToChainId(chainId);
};

export function getEntireDIDAelfAddress(value: string, defaultPrefix?: string, defaultSuffix?: string) {
  const arr = value.split('_');
  if (arr.length > 3 || arr.length === 0) return '';
  if (arr.length === 3)
    return `${defaultPrefix ? defaultPrefix : arr[0]}_${arr[1]}_${defaultSuffix ? defaultSuffix : arr[2]}`;
  if (arr.length === 1) return `${defaultPrefix || 'ELF'}_${value}_${defaultSuffix || 'AELF'}`;
  if (isAelfAddress(arr[0])) return `${defaultPrefix || 'ELF'}_${value}`;
  return `${value}_${defaultSuffix || 'AELF'}`;
}

export const supplementAllAelfAddress = (address: string, prefix?: string, suffix?: string) => {
  const arr = address.split('_');
  let value;
  arr.forEach((str) => {
    if (isAelfAddress(str)) value = str;
  });
  if (!value) return '';
  if (arr[0] !== value) prefix = prefix ? prefix : arr[0];
  if (arr.slice(-1)[0] !== value) suffix = suffix ? suffix : arr.slice(-1)[0];
  return `${prefix || 'ELF'}_${value}_${suffix || 'AELF'}`;
};

/**
 * to check if the transfer is crossChain
 */
export const isCrossChain = (toAddress: string, fromChainId: ChainId): boolean => {
  if (!toAddress.includes('_')) return false;
  const arr = toAddress.split('_');
  const addressChainId = arr[arr.length - 1];
  // no suffix
  if (isAelfAddress(addressChainId)) {
    return false;
  }
  return addressChainId !== fromChainId;
};

export const getAddressChainId = (toAddress: string, defaultChainId: ChainId) => {
  if (!toAddress.includes('_')) return defaultChainId;
  const arr = toAddress.split('_');
  const addressChainId = arr[arr.length - 1];
  // no suffix
  if (isAelfAddress(addressChainId)) {
    return defaultChainId;
  }
  return addressChainId;
};

export function isDIDAelfAddress(value?: string) {
  if (!value || !isValidBase58(value)) return false;
  if (value.includes('_') && value.split('_').length === 2) {
    const arr = value.split('_');
    const res = arr[0].length > arr[1].length ? arr[0] : arr[1];
    try {
      return !!AElf.utils.decodeAddressRep(res);
    } catch {
      return false;
    }
  }
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}

export function isDIDAddress(address: string, chainType: ChainType = 'aelf') {
  if (chainType === 'aelf') return isDIDAelfAddress(address);
  throw Error('Not support');
}

export function getAelfAddress(value = '') {
  const arr = value.split('_');
  if (arr.length === 3) return arr[1];
  for (let i = 0; i < arr.length; i++) {
    if (isAelfAddress(arr[i])) return arr[i];
  }
  return value;
}

export const getChainIdByAddress = (address: string, chainType: ChainType = 'aelf') => {
  // if (!isAddress(address)) throw Error(`${address} is not address`);

  if (chainType === 'aelf') {
    if (address.includes('_')) {
      const arr = address.split('_');
      return arr[arr.length - 1];
    } else {
      return 'AELF';
    }
  }
  throw Error('Not support');
};

export const getAelfTxResult = (rpcUrl: string, txId: string) => {
  const aelfInstance = aelf.getAelfInstance(rpcUrl);
  return getTxResult(aelfInstance, txId);
};
