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
