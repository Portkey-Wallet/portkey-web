export type PaymentMerchantType = 'Alchemy';

export interface AchTxAddressReceivedType {
  merchantName: PaymentMerchantType;
  orderId: string;
  crypto: string;
  network: string;
  cryptoAmount: string;
  address: string;
}

export interface RequestOrderTransferredType extends AchTxAddressReceivedType {
  status: 'Transferred' | 'TransferFailed';
}

export type TransDirectType = 'TokenBuy' | 'TokenSell' | 'NFTBuy' | 'NFTSell';

export enum OrderStatusEnum {
  // The order is initialized, and no callback from the payment supplier is received at this time.
  Initialized = 'Initialized',
  // The supplier calls back a new order and the user has not paid successfully. When the front end jumps back to Portkey, this is the most likely state.
  Created = 'Created',
  // Order payment successful
  Pending = 'Pending',
  // Start settling ELF with merchants
  StartTransfer = 'StartTransfer',
  // The transfer transaction has been sent, but the transaction has not been packaged yet
  Transferring = 'Transferring',
  // The transaction has been packaged and is waiting for LIB (the transaction is in Mined status)
  Transferred = 'Transferred',
  // Transfer transaction failed, ready to try again (When the Pending status is waiting for packaging, other statuses other than Mined are queried)
  TransferFailed = 'TransferFailed',
  // User payment failed
  Failed = 'Failed',
  // LIB confirmed
  Finish = 'Finish',
}

export interface NFTOrderChangedData {
  orderId: string;
  merchantName: string;
  address: string;
  network: string;
  crypto: string;
  cryptoAmount: string;
  status: `${OrderStatusEnum}`;
  transDirect: 'NFTBuy';
}
