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

// import {IEOAWallet, IWallet} from "../wallet.type";
//
// export function getStandardPortkeyWallet(
//   wallet: any,
//   options: {walletName: string}
// ): IEOAWallet{
//   // TODO: Get accountNN from localStorage and NN+1
//   const defaultWalletName = 'accountNN';
//   return {
//     BIP44Path: wallet.BIP44Path, // "m/44'/1616'/0'/0/0"
//     privateKey: wallet.getPrivate,
//     publicKey: wallet.keyPair.getPublic('hex'),
//     address: wallet.address,
//     walletName: options.walletName || defaultWalletName,
//     // {
//     //   ETH: address for eth,
//     //   aelf: address for aelf,
//     // }
//     addresses: {}
//   }
// }
//
// export function getNextBIP44Path(standardWallet: IWallet): string {
//   const BIP44PathArray = standardWallet.BIP44Path.split('/');
//   const BIP44PathArrayLength = BIP44PathArray.length;
//   BIP44PathArray[BIP44PathArrayLength - 1]
//     = (Number.parseInt(BIP44PathArray[BIP44PathArrayLength - 1], 10) + 1).toString();
//   return BIP44PathArray.join('/')
// }
// export function getWalletIdByBIP44Path(BIP44Path: string): string {
//   const BIP44PathArray = BIP44Path.split('/');
//   const BIP44PathArrayLength = BIP44PathArray.length;
//   return BIP44PathArray[BIP44PathArrayLength - 1];
// }
