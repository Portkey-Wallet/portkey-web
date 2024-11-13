import type { IRequestDefaults } from './request';
import type { IStorageSuite } from './storage';
import { IReferralInfo, IExtraInfo } from './wallet';
export interface IConfig {
  requestDefaults?: IRequestDefaults;
  graphQLUrl?: string;
  storageMethod?: IStorageSuite;
  /** Get the service url of user jwt token  */
  connectUrl?: string;
  referralInfo?: IReferralInfo;
  extraInfo?: IExtraInfo;
}

export interface IReferralConfig {
  referralInfo?: IReferralInfo;
  setReferralInfo(info: IReferralInfo): void;
  getReferralInfo(): void;
}

export interface IExtraInfoConfig {
  extraInfo?: IExtraInfo;
  setExtraInfo(info: IExtraInfo): void;
  getExtraInfo(): void;
}
