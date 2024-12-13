export enum AmountSign {
  PLUS = '+',
  MINUS = '-',
  USD = '$ ',
  EMPTY = '',
}

export enum TransactionStatus {
  Conflict = 'CONFLICT',
  Failed = 'FAILED',
  Mined = 'MINED',
  NodeValidationFailed = 'NODE_VALIDATION_FAILED',
  NotExisted = 'NOT_EXISTED',
  Pending = 'PENDING',
  PendingValidation = 'PENDING_VALIDATION',
}

export enum TransactionTypesEnum {
  TRANSFER = 'Transfer',
  CROSS_CHAIN_TRANSFER = 'CrossChainTransfer', // CrossChain Transfer
  CLAIM_TOKEN = 'ClaimToken', // faucet receive transfer
  TRANSFER_RED_PACKET = 'TransferRedPacket',
  CROSS_CHAIN_RECEIVE = 'ReleaseToken', // CrossChain Receive
  SWAP = 'SwapExactTokensForTokens', // Awaken
}
