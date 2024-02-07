import { ChainId, IBaseWalletAccount } from '@portkey/types';
import { AchTxAddressReceivedType } from '@portkey/socket';
import { CAInfo } from '@portkey/did';
import { GuardianApprovedItem } from '../components/Guardian/utils/type';
import { RampType } from '@portkey/ramp';
import { TokenItemShowType } from '../components/types/assets';

export enum RampDrawerType {
  TOKEN = 'TOKEN',
  CURRENCY = 'CURRENCY',
}

export interface IRampConfig {
  isBuySectionShow: boolean;
  isSellSectionShow: boolean;
  isManagerSynced: boolean;
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
  side: RampType;
};

export type IRampPreviewInitState = {
  crypto: string;
  network: string;
  fiat: string;
  country: string;
  amount: string;
  side: RampType;
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
  tokenInfo: ITokenInfo;
  portkeyWebSocketUrl: string; // ip
}

export type NFTCheckoutType = 'MARKET' | 'MINT';

export type IRampLimit = {
  symbol: string;
  minLimit: number;
  maxLimit: number;
};

export type TRampLocationState = Partial<TRampPreviewLocationState>;

export type TRampPreviewLocationState = {
  crypto: string;
  network: string;
  fiat: string;
  country: string;
  amount: string;
  side: RampType;
  tokenInfo?: TokenItemShowType;
  openGuardiansApprove?: boolean;
  approveList?: GuardianApprovedItem[];
};

export interface ILimitTextParams {
  min: string | number;
  max: string | number;
  symbol: string;
}
export interface IErrMsgHandlerParams extends ILimitTextParams {
  amount: string;
}

export interface IValidValueCheckParams {
  amount: string;
  min: string | number;
  max: string | number;
}
