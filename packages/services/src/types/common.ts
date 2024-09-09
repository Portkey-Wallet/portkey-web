import { SendSecondaryVerificationCodeRequestParams } from './verification';

export type TCommonService = {
  saveData(params: TSaveDataApiParams): Promise<string>;
  getSecondaryMail(): Promise<TSecondaryMail>;
  verifySecondaryMail(params: SendSecondaryVerificationCodeRequestParams): Promise<TVerifierResult>;
  checkSecondaryMail(params: TSecondaryMailCheckParams): Promise<TCheckVerifierResult>;
  setSecondaryMail(params: TVerifierResult): Promise<string>;
};

export type TSaveDataApiParams = Record<string, any>;
export type TSecondaryMail = {
  secondaryEmail: string;
};
export type TVerifierResult = {
  verifierSessionId: string;
};
export type TSecondaryMailCheckParams = {
  verificationCode: string;
  verifierSessionId: string;
};

export type TCheckVerifierResult = {
  verifiedResult: boolean;
};
