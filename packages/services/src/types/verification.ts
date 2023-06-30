import { ChainId } from '@portkey/types';
import { AccountType, CheckGoogleRecaptchaParams, RecaptchaType } from '.';

export type SendVerificationCodeParams = {
  type: AccountType;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
  operationType: RecaptchaType;
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

export enum VerifierCodeOperationType {
  unknown = 0,
  register = 1,
  communityRecovery = 2,
  addGuardian = 3,
  deleteGuardian = 4,
  editGuardian = 5,
  removeOtherManager = 6,
}

export type VerifyVerificationCodeParams = {
  verifierSessionId: string;
  verificationCode: string;
  guardianIdentifier: string;
  verifierId: string;
  chainId: ChainId;
  verifierCodeOperation: VerifierCodeOperationType;
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
  verifierCodeOperation: VerifierCodeOperationType;
};

export type VerifyAppleTokenParams = {
  identityToken: string;
  verifierId: string;
  chainId: ChainId;
  verifierCodeOperation: VerifierCodeOperationType;
};

export type SendAppleUserExtraInfoResult = { userId: string };
export interface IVerificationService {
  getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
  verifyGoogleToken(params: VerifyGoogleTokenParams): Promise<VerifyVerificationCodeResult>;
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean>;
}
