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
  Initialized = 'Initialized',
  Created = 'Created',
  Pending = 'Pending',
  StartTransfer = 'StartTransfer',
  Transferred = 'Created',
  TransferFailed = 'TransferFailed',
  Failed = 'Failed',
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
