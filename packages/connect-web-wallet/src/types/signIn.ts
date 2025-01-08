import { AccountType } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { CSSProperties, ReactNode } from 'react';
import { ISocialLogin } from '../context/types';

export interface GuardianInputInfo {
  identifier: string;
  accountType: AccountType;
  authenticationInfo?: {
    authToken?: string;
    idToken?: string;
    nonce?: string;
    timestamp?: number;
  };
}

export interface IGuardianIdentifierInfo extends GuardianInputInfo {
  chainId: ChainId;
  isLoginGuardian?: boolean;
}

export type TOnSuccessExtraData = {
  caAddress: string;
  caHash: string;
  originChainId: ChainId;
};

export interface IBaseGetGuardianProps {
  defaultChainId?: ChainId;
  className?: string;
  style?: CSSProperties;
  isErrorTip?: boolean;
  isShowScan?: boolean; // show scan button
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  extraElementList?: ReactNode[]; // extra element
  recommendIndexes?: number[];
  onSuccess?: (value: IGuardianIdentifierInfo, extraData?: TOnSuccessExtraData) => void;
  onInputConfirmStart?: () => void;
}

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
