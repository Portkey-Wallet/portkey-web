import { ChainId } from '@portkey-v1/types';

export interface IWalletBalanceCheckParams {
  caHash: string;
  checkTransferSafeChainId: ChainId;
}

export interface IAccelerateGuardian {
  type: string;
  verifierId: string;
  identifierHash: string;
  salt: string;
  isLoginAccount: boolean;
  transactionId: string;
  chainId: ChainId;
}
export interface IWalletBalanceCheckResponse {
  isOriginChainSafe: boolean;
  isSynchronizing: boolean;
  isTransferSafe: boolean;
  accelerateGuardians: IAccelerateGuardian[];
}

export interface ISecurityService {
  getWalletBalanceCheck(params: IWalletBalanceCheckParams): Promise<IWalletBalanceCheckResponse>;
  getPaymentSecurityList(params: IPaymentSecurityListParams): Promise<IPaymentSecurityListResponse>;
}

export interface ITransferLimitItem {
  chainId: ChainId;
  symbol: string;
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
  decimals: number | string;
  defaultSingleLimit?: string;
  defaultDailyLimit?: string;
}

export interface IPaymentSecurityListParams {
  caHash: string;
  skipCount: number;
  maxResultCount: number;
}

export interface IPaymentSecurityListResponse {
  data: ITransferLimitItem[];
  totalRecordCount: number;
  code?: number;
  message?: string;
}
