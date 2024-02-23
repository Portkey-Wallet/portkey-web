import { AccountTypeEnum } from '@portkey/services';

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
