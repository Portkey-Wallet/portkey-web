import BigNumber from 'bignumber.js';
import { ZERO } from '../constants/misc';
import { MAIN_CHAIN, MAIN_CHAIN_ID, SIDE_CHAIN, TEST_NET } from '../constants/network';

export const formatAmountShow = (
  count: number | BigNumber | string,
  decimal: string | number = 4,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
) => {
  const bigCount = BigNumber.isBigNumber(count) ? count : new BigNumber(count || '');
  if (bigCount.isNaN()) return '0';
  return bigCount.decimalPlaces(Number(decimal), roundingMode).toFormat();
};

export function divDecimals(val?: BigNumber.Value, decimals: string | number = 18) {
  if (!val) return ZERO;
  const bigA = ZERO.plus(val);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.div(decimals);
  return bigA.div(`1e${decimals}`);
}

export function timesDecimals(a?: BigNumber.Value, decimals: string | number = 18) {
  if (!a) return ZERO;
  const bigA = ZERO.plus(a);
  if (bigA.isNaN()) return ZERO;
  if (typeof decimals === 'string' && decimals.length > 10) return bigA.times(decimals);
  return bigA.times(`1e${decimals}`);
}

export function transNetworkText(chainId: string, isMainnet?: boolean): string {
  return `${chainId === MAIN_CHAIN_ID ? MAIN_CHAIN : SIDE_CHAIN} ${chainId}${isMainnet ? '' : ' ' + TEST_NET}`;
}
