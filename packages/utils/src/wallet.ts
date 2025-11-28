import AElf from 'aelf-sdk';
export const getNextBIP44Path = (BIP44Path: string) => {
  const BIPArr = BIP44Path.split('/');
  if (isNaN(+BIPArr[BIPArr.length - 1])) return "m/44'/1616'/0'/0/0";

  BIPArr.splice(-1, 1, (+BIPArr[BIPArr.length - 1] + 1).toString());
  return BIPArr.join('/');
};

export function isEqAddress(a1?: string, a2?: string) {
  return a1?.toLocaleLowerCase() === a2?.toLocaleLowerCase();
}
export function isPrivateKey(privateKey?: string) {
  try {
    if (privateKey && typeof privateKey === 'string')
      return Uint8Array.from(Buffer.from(privateKey, 'hex')).length === 32;
  } catch (error) {
    return false;
  }
  return false;
}

export function handlePrivateKey(privateKey: string) {
  if (privateKey.slice(0, 2) === '0x') privateKey = privateKey.slice(2);
  return privateKey;
}

export const isValidBase58 = (str: string) => {
  return !/[\u4e00-\u9fa5\u3000-\u303f\uff01-\uff5e]/.test(str);
};

export function isELFAddress(value?: string) {
  if (!value || !isValidBase58(value)) return false;
  if (value.includes('_') && value.split('_').length < 3) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}
export enum SupportedChainId {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

export function isELFAddressSuffix(value?: string) {
  if (!value) return false;
  if (isELFAddress(value)) {
    const arr = value.split('_');

    if (arr && arr.length === 3 && Object.values(SupportedChainId).includes(arr[2] as any)) {
      return true;
    }
  }
  return false;
}

export const removeAddressSuffix = (address: string) => {
  const arr = address.split('_');
  if (arr.length === 3) return arr[1];

  return address;
};

export const removeELFAddressSuffix = (address: string) => {
  if (isELFAddressSuffix(address)) return removeAddressSuffix(address);

  return address;
};
