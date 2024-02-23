import BigNumber from 'bignumber.js';

export const DIGIT_CODE = {
  // digit code expiration time (minutes)
  expiration: 10,
  // digit code length
  length: 6,
};

export const PASSWORD_LENGTH = 6;

export const ZERO = new BigNumber(0);

export const isEffectiveNumber = (v: any) => {
  const val = new BigNumber(v);
  return !val.isNaN() && !val.lte(0);
};
