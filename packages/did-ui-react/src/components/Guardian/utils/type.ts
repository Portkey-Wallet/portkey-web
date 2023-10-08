import { AccountTypeEnum } from '@portkey/services';

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
