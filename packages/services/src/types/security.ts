import { ChainId } from '@portkey/types';

export interface IWalletBalanceCheckParams {
  caHash: string;
}
export interface IWalletBalanceCheckResponse {
  isSafe: boolean;
}

export interface ISecurityService {
  getWalletBalanceCheck(params: IWalletBalanceCheckParams): Promise<IWalletBalanceCheckResponse>;
  getPaymentSecurityList(params: IPaymentSecurityListParams): Promise<IPaymentSecurityListResponse>;
}

export interface IPaymentSecurityItem {
  chainId: ChainId;
  symbol: string;
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
  decimals: number | string;
}

export interface IPaymentSecurityListParams {
  caHash: string;
  skipCount: number;
  maxResultCount: number;
}

export interface IPaymentSecurityListResponse {
  data: IPaymentSecurityItem[];
  totalRecordCount: number;
  code?: number;
  message?: string;
}
