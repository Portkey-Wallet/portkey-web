import { IBaseNFTType } from './assets';
import { ChainId } from './chain';

export enum TransactionTypes {
  TRANSFER = 'Transfer',
  CROSS_CHAIN_TRANSFER = 'CrossChainTransfer', // CrossChain Transfer
  CLAIM_TOKEN = 'ClaimToken', // faucet receive transfer
}

export type TransactionFees = {
  symbol: string;
  fee: number;
  feeInUsd: string;
  decimals: string;
};

export type ActivityItemType = {
  transactionType: TransactionTypes;
  transactionName?: string; // item title
  from: string; // wallet name
  to: string; // to user nick name
  fromAddress: string;
  toAddress: string;
  fromChainId: ChainId;
  toChainId: ChainId;
  status: string;
  transactionId: string;
  blockHash: string; // The chain may have forks, use transactionId and blockHash to uniquely determine the transaction
  timestamp: string;
  isReceived: boolean; // Is it a received transaction
  amount: string;
  symbol: string;
  decimals?: string;
  priceInUsd?: string;
  nftInfo?: IBaseNFTType;
  transactionFees: TransactionFees[];
  listIcon?: string;
  isDelegated?: boolean;
};
