import type { IRequestDefaults } from './request';
import type { IStorageSuite } from './storage';
import { IReferralInfo } from './wallet';
export interface IConfig {
  requestDefaults?: IRequestDefaults;
  graphQLUrl?: string;
  storageMethod?: IStorageSuite;
  /** Get the service url of user jwt token  */
  connectUrl?: string;
  referralInfo?: IReferralInfo;
}

export interface IReferralConfig {
  referralInfo?: IReferralInfo;
  setReferralInfo(info: IReferralInfo): void;
  getReferralInfo(): void;
}
