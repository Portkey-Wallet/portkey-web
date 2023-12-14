export const Valid_Integer = /^(0*[1-9]\d*)$/;
export function isValidInteger(num?: string) {
  if (!num) return false;
  return Valid_Integer.test(num);
}
