import { ChainId } from '@portkey-v1/types';

export type FetchTxFeeParams = {
  chainIds: ChainId[];
};
export type FetchTxFeeResultItemTransactionFee = {
  ach: number;
  crossChain: number;
  max: number;
};
export type FetchTxFeeResultItem = {
  chainId: ChainId;
  transactionFee: FetchTxFeeResultItemTransactionFee;
};
export type FetchTxFeeResult = FetchTxFeeResultItem[];

export interface ITokenService {
  fetchTxFee(params: FetchTxFeeParams): Promise<FetchTxFeeResult>;
}
