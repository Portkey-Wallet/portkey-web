import { ChainId, TStringJSON } from '@portkey/types';
import { AccountType, CheckGoogleRecaptchaParams, OperationTypeEnum } from '.';
import { TelegramWebappInitData } from '@portkey/types';

export type SendVerificationCodeParams = {
  type: AccountType;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
  targetChainId?: ChainId;
  operationType: OperationTypeEnum;
  operationDetails?: TStringJSON;
};

export type SendVerificationCodeRequestParams = {
  params: SendVerificationCodeParams;
  headers?: {
    reCaptchaToken: string;
    [x: string]: string;
  };
};
export type SendSecondaryVerificationCodeRequestParams = {
  params: { secondaryEmail: string; platformType?: number };
  headers?: {
    reCaptchaToken: string;
    [x: string]: string;
  };
};
export type SendVerificationCodeResult = {
  verifierSessionId: string;
};

export type VerifyVerificationCodeParams = {
  verifierSessionId: string;
  verificationCode: string;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
  targetChainId?: ChainId;
  operationType: OperationTypeEnum;
  operationDetails: TStringJSON;
  caHash?: string;
};
export type VerifySecondaryVerificationCodeParams = {
  verifierSessionId: string;
  verificationCode: string;
  secondaryEmail: string;
};
export type VerifyVerificationCodeResult = {
  verificationDoc?: string;
  signature?: string;
  zkLoginInfo?: ZKLoginInfo;
};

export type VerifyZKLoginResult = {
  guardianIdentifierHash: string;
};

export type SendAppleUserExtraInfoParams = {
  identityToken: string;
  userInfo: {
    name: {
      firstName: string;
      lastName?: string;
    };
    email?: string;
  };
};

export type BaseVerifyTokenParams = {
  verifierId: string;
  chainId: ChainId;
  operationType: OperationTypeEnum;
  targetChainId?: ChainId;
  operationDetails: TStringJSON;
};

export interface VerifierSocialTokenParams extends BaseVerifyTokenParams {
  accessToken: string;
  caHash?: string;
}

export interface VerifyAppleTokenParams extends BaseVerifyTokenParams {
  identityToken: string;
  caHash?: string;
}

export type VerifyZKPortkeyParams = {
  type: string;
  accessToken?: string;
  jwt?: string;
  verifierId?: string;
  chainId: ChainId;
  operationType: OperationTypeEnum;
  caHash?: string;
  operationDetails?: string;
  targetChainId?: string;
};

export type VerifyZKLoginParams = {
  verifyToken: VerifyZKPortkeyParams;
  jwt?: string;
  salt: string;
  kid: string;
  nonce?: string;
  timestamp: number;
  managerAddress: string;
  networkType?: 'MAINNET' | 'TESTNET';
};

export interface ZKLoginInfo {
  identifierHash: string;
  poseidonIdentifierHash: string;
  identifierHashType: number;
  salt: string;
  zkProof: string;
  jwt: string;
  nonce: string;
  timestamp: number;
  managerAddress: string;
  circuitId: string;
}

export type SendAppleUserExtraInfoResult = { userId: string };

export type GetAppleUserExtraInfoParams = { userId: string };

export type getAppleUserExtraInfoResult = {
  email: string;
  firstName: string | null;
  fullName: string | null;
  guardianType: string;
  id: string;
  isPrivate: boolean;
  lastName: string | null;
};

export type GetRecommendationVerifierParams = {
  chainId: ChainId;
};

export type VerifierItem = {
  id: string;
  name: string;
  imageUrl: string;
};

export type VerifyTwitterTokenHeader = {
  'oauth-version': string;
  [x: string]: string;
};

export type TGetTelegramAuthTokenParams = TelegramWebappInitData & {
  bot_id: string;
};

export type TGetTelegramAuthTokenResult = {
  token: string;
};

export interface IVerificationService {
  getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
  getAppleUserExtraInfo(params: GetAppleUserExtraInfoParams): Promise<getAppleUserExtraInfoResult>;
  verifyGoogleToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyZKLogin(params: any): Promise<VerifyZKLoginResult>;
  verifyTelegramToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyTwitterToken(
    params: VerifierSocialTokenParams,
    headers?: VerifyTwitterTokenHeader,
  ): Promise<VerifyVerificationCodeResult>;
  verifyFacebookToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean>;
  getRecommendationVerifier(params: GetRecommendationVerifierParams): Promise<VerifierItem>;
  getTelegramAuthToken(params: TGetTelegramAuthTokenParams): Promise<TGetTelegramAuthTokenResult>;
}
