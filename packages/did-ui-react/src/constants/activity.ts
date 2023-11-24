import { TransactionTypes, TransactionEnum } from '@portkey/types';

export const SHOW_FROM_TRANSACTION_TYPES: TransactionTypes[] = [
  TransactionEnum.TRANSFER,
  TransactionEnum.CROSS_CHAIN_TRANSFER,
  TransactionEnum.CLAIM_TOKEN,
];
