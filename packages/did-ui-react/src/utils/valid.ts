// eslint-disable-next-line no-useless-escape
const PIN_REG = /^[a-zA-Z\d! ~@#_^*%/.+:;=\\|,'~{}\[\]]{6,16}$/;
export function isValidPin(password?: string) {
  if (!password) return false;
  return PIN_REG.test(password);
}

export enum PinErrorMessage {
  invalidPin = 'Invalid Pin',
  PinNotLong = 'Pin is not long enough! (Must be at least 6 characters)',
}

export enum EmailError {
  noEmail = 'Please enter email address',
  invalidEmail = 'Invalid email address',
  alreadyRegistered = 'This address is already registered',
  noAccount = 'Failed to log in with this email. Please use your login account.',
}

export enum WalletError {
  noCreateWallet = 'Please Create an Wallet First!',
}

export function checkEmail(email?: string) {
  if (!email) return EmailError.noEmail;
  if (!isValidEmail(email)) return EmailError.invalidEmail;
}

export const EmailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

export function isValidEmail(email?: string) {
  if (!email) return false;
  return EmailReg.test(email);
}

export const isValidBase58 = (str: string) => {
  return !/[\u4e00-\u9fa5\u3000-\u303f\uff01-\uff5e]/.test(str);
};
