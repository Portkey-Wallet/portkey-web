import { SeedTypeEnum } from './assets';
import { ChainId } from './chain';

export enum TransactionEnum {
  TRANSFER = 'Transfer',
  CROSS_CHAIN_TRANSFER = 'CrossChainTransfer', // CrossChain Transfer
  CLAIM_TOKEN = 'ClaimToken', // faucet receive transfer
  TRANSFER_RED_PACKET = 'TransferRedPacket',
  CROSS_CHAIN_RECEIVE = 'ReleaseToken', // CrossChain Receive
  SWAP = 'SwapExactTokensForTokens', // Awaken
}

export type TransactionFees = {
  symbol: string;
  fee: number;
  feeInUsd: string;
  decimals: string;
};

export type TransactionTypes = `${TransactionEnum}`;

export type ActivityItemType = {
  chainId: ChainId;
  transactionType: TransactionEnum;
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
  priceInUsd?: string; // The unit price at that time
  currentPriceInUsd?: string; // Real-time unit price
  currentTxPriceInUsd?: string; // Real-time tx price
  nftInfo?: NftInfo;
  transactionFees: TransactionFees[];
  listIcon?: string;
  isDelegated?: boolean;
  isSystem?: boolean;
  operations?: TDappOperations[];
  dappName?: string;
  dappIcon?: string;
  fromChainIdUpdated?: string;
  toChainIdUpdated?: string;
  fromChainIcon?: string;
  toChainIcon?: string;
  sourceIcon?: string;
  statusIcon?: string;
};

export type TDappOperations = {
  symbol: string;
  amount: string;
  decimals: string;
  icon?: string;
  isReceived: true;
  nftInfo?: NftInfo;
};

export type NftInfo = {
  imageUrl: string;
  alias: string;
  nftId: string;
  isSeed?: boolean;
  seedType?: SeedTypeEnum;
};
