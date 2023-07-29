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
  data: OrderQuoteType[];
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
};

export type GetAchSignatureParams = {
  address: string;
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

export interface IRampService {
  getFiatList(params: GetFiatListParams): Promise<GetFiatListResult>;
  getCryptoList(params: GetCryptoListParams): Promise<GetCryptoListResult>;
  getOrderQuote(params: GetOrderQuoteParams): Promise<GetOrderQuoteResult>;
  getAchToken(params: GetAchTokenParams): Promise<GetAchTokenResult>;
  getOrderNo(params: GetOrderNoParams): Promise<GetOrderNoResult>;
  getAchSignature(params: GetAchSignatureParams): Promise<GetAchSignatureResult>;
  sendSellTransaction(params: SendSellTransactionParams): Promise<SendSellTransactionResult>;
}
