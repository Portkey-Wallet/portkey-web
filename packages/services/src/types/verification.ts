import { ChainId, TStringJSON } from '@portkey/types';
import { AccountType, CheckGoogleRecaptchaParams, OperationTypeEnum } from '.';

export type SendVerificationCodeParams = {
  type: AccountType;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
  targetChainId?: ChainId;
  operationType: OperationTypeEnum;
};

export type SendVerificationCodeRequestParams = {
  params: SendVerificationCodeParams;
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
};

export type VerifyVerificationCodeResult = {
  verificationDoc: string;
  signature: string;
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
}

export interface VerifyAppleTokenParams extends BaseVerifyTokenParams {
  identityToken: string;
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
export interface IVerificationService {
  getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
  getAppleUserExtraInfo(params: GetAppleUserExtraInfoParams): Promise<getAppleUserExtraInfoResult>;
  verifyGoogleToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyTelegramToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean>;
  getRecommendationVerifier(params: GetRecommendationVerifierParams): Promise<VerifierItem>;
}
