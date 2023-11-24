import { BaseListResponse } from './index';
import { CaAddressInfosType } from './assets';
import { ChainId } from '@portkey/types';

export interface AddressItem {
  chainId: ChainId;
  address: string;
}

export type GetRecentTransactionParams = {
  //   caAddresses?: string[];
  caAddressInfos: CaAddressInfosType;
  skipCount?: number;
  maxResultCount?: number;
};

export interface RecentAddressItem extends AddressItem {
  transactionTime?: string;
}

export interface RecentContactItemType {
  chainId: ChainId;
  caAddress: string;
  address: string;
  addressChainId: ChainId;
  transactionTime: string;
  index?: number;
  name?: string;
  addresses: RecentAddressItem[];
}

export type RecentTransactionResponse = BaseListResponse<RecentContactItemType>;

export type ITransactionService = {
  getRecentTransactionUsers(params: GetRecentTransactionParams): Promise<RecentTransactionResponse>;
};
