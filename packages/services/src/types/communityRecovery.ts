import { AccountType } from '.';
import { ISearchService } from './search';
import { IVerificationService } from './verification';
import { ChainId, IReferralInfo } from '@portkey/types';
import { CaHolderWithGuardian } from '@portkey/graphql';
export interface Context {
  clientId: string;
  requestId: string;
}

export interface GuardiansApproved {
  type?: AccountType;
  identifier: string;
  verifierId: string;
  verificationDoc: string;
  signature: string;
  identifierHash?: string;
}

export interface RegisterParams {
  type: AccountType;
  loginGuardianIdentifier: string;
  manager: string;
  extraData: string;
  chainId: ChainId;
  verifierId: string;
  verificationDoc: string;
  signature: string;
  context: Context;
  referralInfo?: IReferralInfo;
}

export type RegisterResult = {
  sessionId: string;
};

export type RecoveryParams = {
  loginGuardianIdentifier: string;
  manager: string;
  guardiansApproved: Array<GuardiansApproved>;
  extraData: string;
  chainId: ChainId;
  context: Context;
  referralInfo?: IReferralInfo;
};

export type RecoveryResult = {
  sessionId: string;
};

export type GetCAHolderByManagerParams = {
  manager: string;
  chainId: string;
  caHash?: string;
  caAddresses?: string[];
};

export type Maybe<T> = T | null;
export type GetCAHolderByManagerResult = Array<CaHolderWithGuardian>;

export interface Guardian {
  guardianIdentifier: string;
  identifierHash: string;
  isLoginGuardian: boolean;
  salt: string;
  type: AccountType;
  verifierId: string;
}
export interface Manager {
  address: string; //aelf.Address
  extraData: string;
}
export interface IHolderInfo {
  caAddress: string;
  caHash: string;
  guardianList: { guardians: Guardian[] };
  managerInfos: Manager[];
}
export type GetHolderInfoParams = {
  chainId: ChainId;
  caHash?: string;
  guardianIdentifier?: string;
};

export type GetRegisterInfoParams = {
  loginGuardianIdentifier?: string;
  caHash?: string;
};

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
  managerApprove = 8,
  modifyTransferLimit = 9,
  transferApprove = 10,
  unsetLoginAccount = 11,
}

export type CheckGoogleRecaptchaParams = {
  operationType: OperationTypeEnum;
};

export type RegisterInfo = { originChainId: ChainId };

export interface ICountryItem {
  country: string;
  code: string;
  iso: string;
}

export interface IPhoneCountryCodeResult {
  data?: ICountryItem[];
  locateData?: ICountryItem;
}

export type TDeletionEntranceResult = {
  entranceDisplay: boolean;
};

export type TCheckDeletionResult = { validatedAssets: false; validatedGuardian: true; validatedDevice: false };

export type TDeletionAccountParams = {
  appleToken: string;
};

export interface ICommunityRecoveryService extends IVerificationService, ISearchService {
  register(params: RegisterParams): Promise<RegisterResult>;
  recovery(params: RecoveryParams): Promise<RecoveryResult>;
  getHolderInfo(params: GetHolderInfoParams): Promise<IHolderInfo>;
  getHolderInfoByManager(params: GetCAHolderByManagerParams): Promise<GetCAHolderByManagerResult>;
  getRegisterInfo(params: GetRegisterInfoParams): Promise<RegisterInfo>;
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean>;
  getPhoneCountryCodeWithLocal(): Promise<IPhoneCountryCodeResult>;
  getShowDeletionEntrance(): Promise<TDeletionEntranceResult>;
  checkDeletion(): Promise<TCheckDeletionResult>;
  deletionAccount(params: TDeletionAccountParams): Promise<any>;
}
