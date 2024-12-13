import { TransactionEnum } from '@portkey/types';

export const SHOW_FROM_TRANSACTION_TYPES: TransactionEnum[] = [
  TransactionEnum.TRANSFER,
  TransactionEnum.CROSS_CHAIN_TRANSFER,
  TransactionEnum.CLAIM_TOKEN,
  TransactionEnum.TRANSFER_RED_PACKET,
  TransactionEnum.SWAP,
  TransactionEnum.CROSS_CHAIN_RECEIVE,
];

export const SHOW_DAPP_TRANSACTION_TYPES = [TransactionEnum.SWAP];
