import type { portkey } from '@portkey/accounts';
import { CAInfo } from '@portkey/did';
import { ChainId } from '@portkey/types';
export * from './verify';
export * from './signIn';
export * from './reCaptcha';

export type CreateWalletType = 'SignUp' | 'Login' | 'LoginByScan';

export interface DIDWalletInfo {
  caInfo: CAInfo;
  pin: string;
  chainId: ChainId;
  walletInfo: portkey.WalletAccount;
}

export type ObjectType = {
  [key: string]: any;
};

export type IResolveParams = {
  provider: string;
  data?: ObjectType;
};

export interface CreatePendingInfo {
  sessionId: string;
  requestId: string;
  clientId: string;
  pin: string;
  walletInfo: portkey.WalletAccount;
}

export type AddManagerType = 'register' | 'recovery' | 'onlyGetPin';

export type LoginFinishWithoutPin = (info: Omit<DIDWalletInfo, 'pin'>) => void;
