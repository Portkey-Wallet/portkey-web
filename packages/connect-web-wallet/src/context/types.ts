import { TSocialResponseData } from '../types/signIn';

export type ISocialLogin = 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';

export type IWeb2Login = 'Email';

export interface IConnectParams {
  socialType: ISocialLogin;
  socialData: TSocialResponseData;
}

export interface IUserInfo {
  manager: {
    address: string;
    pubkey: string;
  };
  aaHash: string;
  aaAddress: string;
}

export type ConnectionStatus = 'loading' | 'connecting' | 'connected' | 'disconnected';
