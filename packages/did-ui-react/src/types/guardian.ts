import { VerifierItem } from '@portkey/did';
import type { AccountType, AccountTypeEnum, Guardian, Manager } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { TSocialLoginHandler } from './wallet';

export interface BaseGuardianItem {
  isLoginGuardian: boolean | undefined;
  verifier?: VerifierItem;
  identifier?: string;
  guardianIdentifier?: string;
  guardianType: AccountType;
  key: string; // `${identifier}&${verifier?.id}`,
  identifierHash?: string;
  salt?: string;
  thirdPartyEmail?: string;
  isPrivate?: boolean;
  firstName?: string;
  lastName?: string;
  accessToken?: string;
}
export interface IVerificationInfo {
  signature?: string;
  verificationDoc?: string;
  verifierId?: string;
}
export interface IVerifierInfo {
  sessionId: string;
}

export interface UserGuardianItem extends BaseGuardianItem {
  verifierInfo?: IVerifierInfo;
  isInitStatus?: boolean;
}

export enum VerifyStatus {
  NotVerified = 'NotVerified',
  Verifying = 'Verifying',
  Verified = 'Verified',
}
export interface UserGuardianStatus extends IVerificationInfo, UserGuardianItem {
  status?: VerifyStatus;
}

// 0: register, 1: community recovery, 2: Add Guardian 3: Set LoginAccount 4: addManager
export enum VerificationType {
  register,
  communityRecovery,
  addGuardian,
  setLoginAccount,
  addManager,
  editGuardianApproval,
}

export type VerifyTokenParams = {
  id: string;
  chainId: ChainId;
  verifierId: string;
  accessToken?: string;
  customLoginHandler?: TSocialLoginHandler;
};

export interface GuardiansInfo {
  guardianList: { guardians: Guardian[] };
  managerInfos: Manager[];
}

export interface IGuardiansApproved {
  type: AccountTypeEnum;
  identifierHash: string;
  verificationInfo: {
    id: string;
    signature: string | number[];
    verificationDoc: string;
  };
}
