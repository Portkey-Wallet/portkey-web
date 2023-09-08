import { AccountType } from '@portkey/services';

export interface verificationInfo {
  id: string;
  signature?: number[];
  verificationDoc?: string;
}
export interface GuardianItem {
  value?: string;
  type: AccountType;
  identifierHash?: string;
  verificationInfo: verificationInfo;
}
