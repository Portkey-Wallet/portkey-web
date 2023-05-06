import { CAInfo } from '@portkey/did';
import { ChainId, IBlockchainWallet } from '@portkey/types';
export * from './verify';
export * from './signIn';
export * from './reCaptcha';

export type CreateWalletType = 'SignUp' | 'Login' | 'LoginByScan';

export interface DIDWalletInfo {
  caInfo: CAInfo;
  pin: string;
  chainId: ChainId;
  walletInfo: IBlockchainWallet & {
    /** @deprecated `wallet` will delete, `walletInfo` is already the previous `walletInfo.wallet`  */
    wallet: IBlockchainWallet;
  };
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

export type AddManagerType = 'register' | 'recovery' | 'onlyGetPin';

export type LoginFinishWithoutPin = (info: Omit<DIDWalletInfo, 'pin'>) => void;
