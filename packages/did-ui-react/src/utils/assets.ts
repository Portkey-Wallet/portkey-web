import { ChainId } from '@portkey/types';
import { divDecimals, formatAmountShow } from './converter';

export const amountInUsdShow = ({
  balance,
  decimal,
  price,
}: {
  balance: string | number;
  decimal: number | string;
  price: string | number;
}) => `$ ${formatAmountShow(divDecimals(balance, decimal).times(price), 2)}`;

export const chainShowText = (chain: ChainId) => (chain === 'AELF' ? 'MainChain' : 'SideChain');
