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
