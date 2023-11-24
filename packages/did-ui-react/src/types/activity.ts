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
