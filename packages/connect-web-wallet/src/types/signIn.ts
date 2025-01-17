import { ChainId } from '@portkey/types';

export type TOnSuccessExtraData = {
  caAddress: string;
  caHash: string;
  originChainId: ChainId;
};

export type TSocialResponseData = {
  accessToken?: string;
  token?: string;
  [x: string]: any;
};

export enum SocialLoginType {
  APPLE = 'Apple',
  GOOGLE = 'Google',
  TELEGRAM = 'Telegram',
}

export interface ILoginConfig {
  loginMethodsOrder?: ('Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter')[];
  recommendIndexes?: number[];
}

export declare enum Design {
  SocialDesign = 'SocialDesign',
  CryptoDesign = 'CryptoDesign',
  Web2Design = 'Web2Design',
}
export type TDesign = `${Design}`;
