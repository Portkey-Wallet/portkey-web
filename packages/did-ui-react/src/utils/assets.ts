import { ChainId } from '@portkey/types';
import { divDecimals, formatAmountShow } from './converter';
import BigNumber from 'bignumber.js';

export const amountInUsdShow = ({
  balance,
  decimal,
  price,
}: {
  balance: string | number;
  decimal: number | string;
  price: string | number;
}) => `$ ${formatAmountShow(divDecimals(balance, decimal).times(price), 2)}`;

export const chainShowText = (chain: ChainId) => (chain === 'AELF' ? 'MainChain' : 'dAppChain');

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
