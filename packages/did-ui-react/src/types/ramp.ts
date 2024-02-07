import { ChainId } from '@portkey/types';
import { GuardianApprovedItem } from '../components/Guardian/utils/type';
import { RampType } from '@portkey/ramp';
import { TokenItemShowType } from '../components/types/assets';

export type ITokenInfo = {
  decimals: number | string;
  chainId: ChainId;
  symbol: string;
  tokenContractAddress: string;
};

export interface IUseHandleAchSellParams {
  tokenInfo: ITokenInfo;
  portkeyWebSocketUrl: string; // ip
}

export type NFTCheckoutType = 'MARKET' | 'MINT';

export type TRampInitState = Partial<TRampPreviewInitState>;

export type TRampPreviewInitState = {
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

export type IRampLimit = {
  symbol: string;
  minLimit: number;
  maxLimit: number;
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
