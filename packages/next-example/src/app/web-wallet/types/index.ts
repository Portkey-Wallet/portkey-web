import { IVerifyInfo, TVerifierItem } from '@portkey/did-ui-react';
import { PortkeyResultType } from './error';

export interface IRequestPayload {
  method: string;
  eventName: string;
  origin: string;
  payload: any;
}

export enum WalletPageType {
  Login = 'Login',
  Assets = 'Assets',
  UnLock = 'UnLock',
  GuardianApproveForLogin = 'GuardianApproveForLogin',
  CustomLogin = 'CustomLogin',
  AddGuardian = 'AddGuardian',
  SetAllowance = 'SetAllowance',
}

export type TSignUpVerifier = { verifier: TVerifierItem } & IVerifyInfo;

export enum SocialLoginType {
  APPLE = 'Apple',
  GOOGLE = 'Google',
  TELEGRAM = 'Telegram',
}

export enum OperationTypeEnum {
  // unknown
  unknown = 0,
  // register
  register = 1,
  // community recovery
  communityRecovery = 2,
  // add guardian
  addGuardian = 3,
  // delete guardian
  deleteGuardian = 4,
  // edit guardian
  editGuardian = 5,
  // remove other manager
  removeOtherManager = 6,
  // set login account
  setLoginAccount = 7,
}

export type SendResponseParams = PortkeyResultType & { data?: any };
