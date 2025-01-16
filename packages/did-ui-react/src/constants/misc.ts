import BigNumber from 'bignumber.js';

export const DIGIT_CODE = {
  // digit code expiration time (minutes)
  expiration: 10,
  // digit code length
  length: 6,
};

export const PASSWORD_LENGTH = 6;

export const LANG_MAX = new BigNumber('9223372036854774784');

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);
export const ONE_THOUSAND = new BigNumber(1000);
export const TEN_THOUSAND = new BigNumber(10000);
export const ONE_MILLION = new BigNumber(1000000);
export const ONE_BILLION = new BigNumber(1000000000);
export const ONE_TRILLION = new BigNumber(1000000000000);

export const isEffectiveNumber = (v: any) => {
  const val = new BigNumber(v);
  return !val.isNaN() && !val.lte(0);
};
