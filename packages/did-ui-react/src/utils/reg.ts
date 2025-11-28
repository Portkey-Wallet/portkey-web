export const Valid_Integer = /^(0*[1-9]\d*)$/;
export function isValidInteger(num?: string) {
  if (!num) return false;
  return Valid_Integer.test(num);
}
export const POTENTIAL_NUMBER = /^(0|[1-9]\d*)(\.\d*)?$/;
export const isPotentialNumber = (str: string) => {
  return POTENTIAL_NUMBER.test(str);
};

const P_N_REG_V2 = /^(0|([1-9][0-9]*))(\.[0-9]*)?$/;
export function isValidNumberV2(n: string) {
  if (n.includes('-')) return false;
  return P_N_REG_V2.test(n);
}

export const STRICT_INTEGER = /^(0|[1-9]\d*)$/;
export function isStrictInteger(num?: string) {
  if (!num) return false;
  return STRICT_INTEGER.test(num);
}
