import BigNumber from 'bignumber.js';

export function checkIsCipherText(input: string): boolean {
  const sha256Regex = /^[a-zA-Z0-9=]+$/;
  return sha256Regex.test(input);
}

export const isNFT = (symbol: string) => {
  if (!symbol) return false;
  if (!symbol.includes('-')) return false;
  const lastStr = symbol.split('-').splice(-1)[0];
  return !BigNumber(lastStr).isNaN();
};

export const isNFTCollection = (symbol: string) => {
  if (!isNFT(symbol)) return false;
  const lastStr = symbol.split('-').splice(-1)[0];
  return BigNumber(lastStr).isZero();
};

export const getApproveSymbol = (symbol: string) => {
  if (!isNFT(symbol) || isNFTCollection(symbol)) return symbol;

  const collectionName = symbol.split('-')[0];
  return `${collectionName}-*`;
};
