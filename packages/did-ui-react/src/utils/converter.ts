import BigNumber from 'bignumber.js';
import { ZERO, isEffectiveNumber } from '../constants/misc';
import { MAIN_CHAIN, MAIN_CHAIN_ID, SIDE_CHAIN, TEST_NET } from '../constants/network';
import { DEFAULT_AMOUNT, DEFAULT_DIGITS } from '../constants';
import { AmountSign } from '../types/activity';
import { ChainId, ChainType } from '@portkey/types';
import moment from 'moment';

export const formatTokenAmountShowWithDecimals = (
  amount?: number | BigNumber.Value | string,
  decimal: string | number = 4,
) => {
  return formatAmountShow(divDecimals(amount, decimal), decimal);
};

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
  return `aelf ${chainId === MAIN_CHAIN_ID ? MAIN_CHAIN : SIDE_CHAIN}${isMainnet ? '' : ' ' + TEST_NET}`;
}

export function transNetworkTextV2({
  chainId,
  chainType = 'aelf',
  isMainnet,
  networkName,
}: {
  chainId?: ChainId;
  chainType?: string;
  isMainnet?: boolean;
  networkName?: string;
}): string {
  if (chainType !== 'aelf') return networkName || '';

  return `aelf ${chainId === MAIN_CHAIN_ID ? MAIN_CHAIN : SIDE_CHAIN}${isMainnet ? '' : ' ' + TEST_NET}`;
}

export function divDecimalsStr(a?: BigNumber.Value, decimals: string | number = 8, defaultVal = '--') {
  const n = divDecimals(a, decimals);
  return isEffectiveNumber(n) ? n.toFormat() : defaultVal;
}

export interface IFormatWithCommasProps {
  amount?: string | number;
  decimals?: string | number;
  digits?: number;
  sign?: AmountSign;
}

/**
 * formatAmount with prefix and thousand mark, not unit
 * @example $11.1  +11.1  -11.1  9,999.9
 */
export function formatWithCommas({
  amount = DEFAULT_AMOUNT,
  decimals,
  digits = DEFAULT_DIGITS,
  sign = AmountSign.EMPTY,
}: IFormatWithCommasProps): string {
  const decimal = decimals || 0;
  const amountTrans = `${divDecimals(ZERO.plus(amount), decimal).decimalPlaces(digits).toFormat()}`;

  if (sign && amountTrans !== '0') {
    return `${sign}${amountTrans}`;
  }
  return amountTrans;
}

/**
 * format address like "aaa...bbb" to "ELF_aaa...bbb_AELF"
 * @param address -
 * @param chainId -
 * @param chainType -
 * @returns
 */
export const addressFormat = (
  address = 'address',
  chainId: ChainId = 'AELF',
  chainType: ChainType = 'aelf',
): string => {
  if (chainType !== 'aelf') return address;
  const arr = address.split('_');
  if (address.includes('_') && arr.length < 3) return address;
  if (address.includes('_')) return `ELF_${arr[1]}_${chainId}`;
  return `ELF_${address}_${chainId}`;
};

export const dateFormatTransTo13 = (ipt?: moment.MomentInput) => {
  let time = String(ipt);
  while (time.length < 13) {
    time = time + '0';
  }
  return moment(Number(time)).format('MMM D, YYYY [at] h:mm a');
};
