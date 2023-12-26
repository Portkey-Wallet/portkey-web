import { AccountTypeEnum } from '@portkey-v1/services';

export interface verificationInfo {
  id: string;
  signature?: number[];
  verificationDoc?: string;
}
export interface GuardianItem {
  value?: string;
  type: AccountTypeEnum;
  identifierHash?: string;
  verificationInfo: verificationInfo;
}
