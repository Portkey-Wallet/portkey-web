import { BaseListResponse } from './index';

export type RampType = 'BUY' | 'SELL';

export type GetFiatListParams = {
  type: RampType;
};

export interface BaseFiatType {
  currency: string; // 3 letters fiat code
  country: string; // 2 letters region code
  payWayCode: string; // code of payment
  payWayName: string; // name of payment
  fixedFee: number | string; // ramp flat rate
  rateFee?: number | string; // ramp percentage rate
  payMin: number | string;
  payMax: number | string;
}

export type GetFiatListResult = {
  data: BaseFiatType[];
  returnCode: string;
  returnMsg: string;
};
export type GetCryptoListParams = {
  fiat: string;
};

export type CryptoInfoType = {
  crypto: string;
  network: string;
  buyEnable: string;
  sellEnable: string;
  minPurchaseAmount: number | null;
  maxPurchaseAmount: number | null;
  address: null;
  icon: string;
  minSellAmount: number | null;
  maxSellAmount: number | null;
};
export type GetCryptoListResult = {
  data: CryptoInfoType[];
  returnCode: string;
  returnMsg: string;
};

export type OrderQuoteType = {
  crypto: string;
  cryptoPrice: string;
  cryptoQuantity?: string;
  fiat: string;
  rampFee: string;
  networkFee: string;
  fiatQuantity?: string;
};
export type GetOrderQuoteParams = {
  crypto: string;
  network: string;
  fiat: string;
  country: string;
  amount: string;
  side: string;
  type?: 'ONE' | 'ALL';
};
export type GetOrderQuoteResult = {
  data: OrderQuoteType;
  returnCode: string;
  returnMsg: string;
};

export type AchTokenInfoType = {
  id: string;
  email: string;
  accessToken: string;
};
export type GetAchTokenParams = {
  email: string;
};
export type GetAchTokenResult = {
  data: AchTokenInfoType;
  returnCode: string;
  returnMsg: string;
};

export type GetOrderNoParams = {
  transDirect: 'TokenBuy' | 'TokenSell';
};
export type GetOrderNoResult = {
  success: boolean;
  id?: string;
  returnMsg: string;
};

export type GetAchSignatureParams = {
  address: string;
};

export type GetAchNFTSignatureParams = {
  appId: string;
  timestamp: string;
  timeout: string;

  fiat?: string; // fiat type, char code with ISO4217 encoding currency unit, USD/EUR/SGD/JPY/GBP, etc.
  amount?: string; // Total NFT order fiat amount. The payment channel fee that the user needs to pay will be deducted from the amount. Required parameter for fiat-based
  crypto?: string; // ELF/ETH.etc ELF default. Required parameter for crypto-based
  cryptoAmount?: string; // Total NFT oder crypto amount，Required parameter for crypto-based
  network?: string; // Parameter for crypto-based Real-time settlement
  targetFiat?: string; // Default fiat payment type for display
  type: 'MARKET' | 'MINT';
  uniqueId?: string; // NFT Unique Identity, Required for NFT type MARKET 🔺
  quantity?: string;
  name: string;
  picture: string;
  redirectUrl: string;
  callbackUrl: string;
  merchantOrderNo: string;
  merchantName?: string;
};
export type GetAchSignatureResult = {
  signature: string;
  returnCode: string;
  returnMsg: string;
};

export type RampMerchantName = 'Alchemy';

export type SendSellTransactionParams = {
  merchantName: RampMerchantName;
  orderId: string;
  rawTransaction: string;
  signature: string;
  publicKey: string;
};
export type SendSellTransactionResult = {};

export type GetAchOrderInfoByOrderIdParams = {
  orderId: string;
  skipCount: number;
  maxResultCount: number;
};
export type NFTOrderSections = {
  id: string;
  nftSymbol: string;
  merchantName: string;
  merchantOrderId: string;
  nftPicture: string;
  sectionName: string;
  expireTime?: string;
  createTime?: string;
};

type NFTTransDirect = 'NFTBuy' | 'NFTSell';

type NFTStatus = 'Initialized' | string;

export type AchNFTOrderInfo = {
  id: string;
  userId: string;
  thirdPartOrderNo?: string;
  merchantName: null;

  transDirect: NFTTransDirect;
  address?: string;
  crypto: string;
  cryptoPrice?: string;
  cryptoAmount: string;
  fiat?: string;
  fiatAmount?: string;
  lastModifyTime: string;
  network?: string;
  status: NFTStatus;
  cryptoQuantity?: string;
  paymentMethod?: string;
  txTime?: string;
  receivingMethod?: string;
  receiptTime?: string;
  transactionId?: string;
  nftOrderSection: NFTOrderSections;
};

export type AchNFTSignatureResult = {
  success: 'Success' | string;
  returnCode: string;
  returnMsg: string;
  extend: string;
  traceId?: string;
  data: string;
};

export type AchNFTTokenResult = {
  success: boolean;
  returnCode: string;
  returnMsg: string;
  extend: string;
  data: AchTokenInfoType;
};

export interface IRampService {
  getFiatList(params: GetFiatListParams): Promise<GetFiatListResult>;
  getCryptoList(params: GetCryptoListParams): Promise<GetCryptoListResult>;
  getOrderQuote(params: GetOrderQuoteParams): Promise<GetOrderQuoteResult>;
  getAchToken(params: GetAchTokenParams): Promise<GetAchTokenResult>;
  getOrderNo(params: GetOrderNoParams): Promise<GetOrderNoResult>;
  getAchSignature(params: GetAchSignatureParams): Promise<GetAchSignatureResult>;
  sendSellTransaction(params: SendSellTransactionParams): Promise<SendSellTransactionResult>;
  getAchNFTToken(params: GetAchTokenParams): Promise<AchNFTTokenResult>;
  getAchNFTOrderInfoByOrderId(params: GetAchOrderInfoByOrderIdParams): Promise<BaseListResponse<AchNFTOrderInfo>>;
  getAchNFTSignature(params: GetAchNFTSignatureParams): Promise<AchNFTSignatureResult>;
}
