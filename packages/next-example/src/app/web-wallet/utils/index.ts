export function checkIsCipherText(input: string): boolean {
  const sha256Regex = /^[a-zA-Z0-9=]+$/;
  return sha256Regex.test(input);
}
