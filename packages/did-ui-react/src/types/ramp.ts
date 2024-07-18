import { ChainId } from '@portkey/types';
import { GuardianApprovedItem } from './guardian';
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
}

export type NFTCheckoutType = 'MARKET' | 'MINT';

export type TRampInitState = Partial<TRampPreviewInitState>;

export type TRampPreviewInitState = {
  crypto: string;
  cryptoIcon: string;
  network: string;
  fiat: string;
  country: string;
  countryName: string;
  fiatIcon: string;
  amount: string;
  side: RampType;
  tokenInfo?: TokenItemShowType;
  openGuardiansApprove?: boolean;
  approveList?: GuardianApprovedItem[];
  openloginSignalClientId?: string;
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
