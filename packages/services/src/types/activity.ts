import { TransactionTypes, ActivityItemType } from '@portkey/types';
import { CaAddressInfosType } from './assets';

export interface IActivitiesApiParams {
  maxResultCount: number;
  skipCount: number;
  caAddresses?: string[];
  caAddressInfos?: { chainId: string; caAddress: string }[];
  managerAddresses?: string[];
  transactionTypes?: TransactionTypes[];
  chainId?: string;
  symbol?: string;
  width?: number;
  height?: number;
}

export interface IActivitiesApiResponse {
  data: ActivityItemType[];
  totalRecordCount: number;
}

export interface IActivityApiParams {
  transactionId: string;
  blockHash: string;
  caAddresses?: string[];
}

export interface IActivityListWithAddressApiParams {
  maxResultCount: number;
  skipCount: number;
  caAddressInfos: CaAddressInfosType[];
  targetAddressInfos: CaAddressInfosType[];
}

export type IActivityService = {
  getActivityList(params: IActivitiesApiParams): Promise<IActivitiesApiResponse>;
  getActivityDetail(params: IActivityApiParams): Promise<ActivityItemType>;
  getRecentContactActivities(params: IActivityListWithAddressApiParams): Promise<IActivitiesApiResponse>;
};
