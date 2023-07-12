import { CAInfo } from '@portkey/did';
import { AccountType } from '@portkey/services';
import { ChainId, IBlockchainWallet } from '@portkey/types';
export * from './verify';
export * from './signIn';
export * from './reCaptcha';

export type CreateWalletType = 'SignUp' | 'Login' | 'LoginByScan';

export type AddManagerType = 'register' | 'recovery' | 'addManager';

export type ManagerInfoType = {
  managerUniqueId: string;
  guardianIdentifier: string;
  accountType: AccountType;
  type: AddManagerType;
};

export interface DIDWalletInfo {
  caInfo: CAInfo;
  pin: string;
  chainId: ChainId;
  walletInfo: IBlockchainWallet;
  accountInfo: ManagerInfoType;
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
  walletInfo: IBlockchainWallet;
}

export type LoginFinishWithoutPin = (info: Omit<DIDWalletInfo, 'pin'>) => void;

export enum GridType {
  qrCodeOnTop,
  qrCodeOnBottom,
}

export type TSize = 'L' | 'S';
export type Theme = 'dark' | 'light';
