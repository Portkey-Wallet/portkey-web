import { AccountTypeEnum } from '@portkey-v1/services';

export interface verificationInfo {
  id: string;
  signature?: number[];
  verificationDoc?: string;
}
export interface GuardianApprovedItem {
  value?: string;
  type: AccountTypeEnum;
  identifierHash?: string;
  verificationInfo: verificationInfo;
}
