import { CAInfo } from '@portkey/did';
import { AccountType } from '@portkey/services';
import { ChainId, IBlockchainWallet } from '@portkey/types';
import { CSSProperties, ReactNode } from 'react';
import { IGuardianIdentifierInfo, IPhoneCountry } from './signIn';
import { OnErrorFunc, TotalAccountType, ValidatorHandler } from '../../types';
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
  createType: AddManagerType;
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
  createType: AddManagerType;
  pin: string;
  walletInfo: IBlockchainWallet;
}

export type LoginFinishWithoutPin = (info: Omit<DIDWalletInfo, 'pin'>) => void;

export enum GridType {
  qrCodeOnTop,
  qrCodeOnBottom,
}

export enum Design {
  SocialDesign = 'SocialDesign',
  CryptoDesign = 'CryptoDesign',
  Web2Design = 'Web2Design',
}

export type TDesign = `${Design}`;

export type TSize = 'L' | 'S';
export type Theme = 'dark' | 'light';

export interface IBaseGetGuardianProps {
  defaultChainId?: ChainId;
  className?: string;
  style?: CSSProperties;
  isErrorTip?: boolean;
  isShowScan?: boolean; // show scan button
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  phoneCountry?: IPhoneCountry; // phone country code info
  extraElementList?: ReactNode[]; // extra element
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  onError?: OnErrorFunc;
  validateEmail?: ValidatorHandler; // validate email
  validatePhone?: ValidatorHandler; // validate phone
  onSuccess?: (value: IGuardianIdentifierInfo) => void;
  onLoginFinishWithoutPin?: LoginFinishWithoutPin; // Only for scan
  onChainIdChange?: (value?: ChainId) => void; // When defaultChainId changed
}
