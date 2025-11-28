export interface ISecuritySuite {
  passwordStrengthCheck(password: string): boolean;
  // applicationHashCheck(): boolean;
}

export interface IStorageSuite {
  getItem(key: string): Promise<any>;
  setItem(key: string, value: any): Promise<any>;
  removeItem(key: string): Promise<any>;
}

export type ISocialLogin = 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';

export type TCustomNetworkType = 'offline' | 'online' | 'local';
