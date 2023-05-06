import { ChainId } from '@portkey/types';
import { AccountType } from '.';

export type SendVerificationCodeParams = {
  type: AccountType;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
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
};

export type VerifyAppleTokenParams = {
  identityToken: string;
  verifierId: string;
  chainId: ChainId;
};

export type SendAppleUserExtraInfoResult = { userId: string };
export interface IVerificationService {
  getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
  verifyGoogleToken(params: VerifyGoogleTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
  checkGoogleRecaptcha(): Promise<boolean>;
}
