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
