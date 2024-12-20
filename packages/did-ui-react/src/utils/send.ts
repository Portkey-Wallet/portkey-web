import { ZERO } from '../constants/misc';

export function getSmallerValue(v1: string, v2: string) {
  if (!v1 || !v2) {
    throw 'invalid value';
  }
  return ZERO.plus(v1).isGreaterThan(v2) ? v2 : v1;
}

export function getLimitTips(symbol: string, from: string | number, to: string | number) {
  return `Transfer limit: ${from} to ${to} ${symbol}`;
}
