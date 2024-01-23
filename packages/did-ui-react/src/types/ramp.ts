import { ChainId, IBaseWalletAccount } from '@portkey-v1/types';
import { AchTxAddressReceivedType } from '@portkey-v1/socket';
import { CAInfo } from '@portkey-v1/did';
import { GuardianApprovedItem } from '../components/Guardian/utils/type';

export enum RampTypeEnum {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum RampDrawerType {
  TOKEN = 'TOKEN',
  CURRENCY = 'CURRENCY',
}

export interface IRampConfig {
  isBuySectionShow: boolean;
  isSellSectionShow: boolean;
  isManagerSynced: boolean;
}

export interface IAchConfig {
  appId: string;
  baseUrl: string;
  updateAchOrder: string;
}

export interface GetFiatType {
  currency: string; // 3 letters fiat code
  country: string; // 2 letters region code
  payWayCode: string; // code of payment
  payWayName: string; // name of payment
  fixedFee: number | string; // ramp flat rate
  rateFee?: number | string; // ramp percentage rate
  payMin: number | string;
  payMax: number | string;
}

export interface FiatType extends GetFiatType {
  countryName?: string;
  icon?: string;
}

export type PartialFiatType = Partial<FiatType>;

export interface AchTokenInfoType {
  token: string;
  expires: number;
}
export interface PaymentStateType {
  buyFiatList: FiatType[];
  sellFiatList: FiatType[];
  achTokenInfo?: AchTokenInfoType;
}

export interface ICurrencyItem {
  country: string;
  iso: string;
  icon: string;
}

export interface ICurToken {
  crypto: string;
  network: string;
}

export type ITokenType = {
  symbol: string;
  chainId: ChainId;
};

export type IRampInitState = {
  crypto: string;
  network: string;
  fiat: string;
  country: string;
  amount: string;
  side: RampTypeEnum;
};

export type IRampPreviewInitState = {
  crypto: string;
  network: string;
  fiat: string;
  country: string;
  amount: string;
  side: RampTypeEnum;
  approveList?: GuardianApprovedItem[];
};

export type ITokenInfo = {
  decimals: number | string;
  chainId: ChainId;
  symbol: string;
  tokenContractAddress: string;
};

export interface PaymentSellTransferResult {
  publicKey: string;
  signature: string; // sign(md5(orderId + rawTransaction))
  rawTransaction: string;
}

export type SellTransferParams = Pick<AchTxAddressReceivedType, 'merchantName' | 'orderId'> & {
  // sellBaseURL: string; // request.defaultConfig.baseURL
  managementAccount: IBaseWalletAccount;
  caInfo: {
    [key: string]: CAInfo;
  };
  paymentSellTransfer: (
    params: AchTxAddressReceivedType & {
      managementAccount: IBaseWalletAccount;
      caInfo: {
        [key: string]: CAInfo;
      };
    },
  ) => Promise<PaymentSellTransferResult>;
};

export interface PaymentLimitType {
  min: number;
  max: number;
}

export interface ISellTransferParams {
  isMainnet: boolean;
  portkeyWebSocketUrl: string; // ip
}

export interface IUseHandleAchSellParams {
  isMainnet: boolean;
  tokenInfo: ITokenInfo;
  portkeyWebSocketUrl: string; // ip
}

export type NFTCheckoutType = 'MARKET' | 'MINT';
