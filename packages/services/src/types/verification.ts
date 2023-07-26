import { ChainId } from '@portkey/types';
import { AccountType, CheckGoogleRecaptchaParams, OperationTypeEnum } from '.';

export type SendVerificationCodeParams = {
  type: AccountType;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
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
  operationType: OperationTypeEnum;
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

export type VerifyGoogleTokenParams = {
  accessToken: string;
  verifierId: string;
  chainId: ChainId;
  operationType: OperationTypeEnum;
};

export type VerifyAppleTokenParams = {
  identityToken: string;
  verifierId: string;
  chainId: ChainId;
  operationType: OperationTypeEnum;
};

export type SendAppleUserExtraInfoResult = { userId: string };

export type GetRecommendationVerifierParams = {
  chainId: ChainId;
};

export type GetRecommendationVerifierResult = {
  id: string;
  name: string;
  imageUrl: string;
};
export interface IVerificationService {
  getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
  verifyGoogleToken(params: VerifyGoogleTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean>;
  getRecommendationVerifier(params: GetRecommendationVerifierParams): Promise<GetRecommendationVerifierResult>;
}
