import BigNumber from 'bignumber.js';
import { isValidNumber } from './valid';

export const formatDec = (value: string, pivot: BigNumber, min: BigNumber, maxLength = 8) => {
  if (pivot.gt(0)) {
    if (min.gt(pivot)) return min.toFixed();
    const [, dec] = value.split('.');
    return (dec?.length || 0) >= (maxLength || 8) ? pivot.toFixed(maxLength || 8, 1) : value;
  }
  return value;
};

export function parseInputChange(value: string, min: BigNumber, maxLength?: number) {
  if (!isValidNumber(value)) return '';
  const pivot = new BigNumber(value);
  return formatDec(value, pivot, min, maxLength);
}
