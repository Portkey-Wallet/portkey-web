import { ChainId } from '@portkey-v1/types';
import { NFTCheckoutByACH, NFTTransDirectEnum } from '../../constants/ramp';
import { ISocialMedia } from '../types/social';

export enum MerchantNameEnum {
  Alchemy = 'Alchemy',
}

export interface IBaseNFTCheckoutProps {
  orderId: string;
  originChainId: ChainId;
  socialMedia?: ISocialMedia[];
  className?: string;
  wrapClassName?: string;
  type?: `${NFTCheckoutByACH}`;
  merchantName?: `${MerchantNameEnum}`;

  appId?: string;
  targetFiat?: string;
  transDirect?: `${NFTTransDirectEnum}`;
  // Only used by Alchemy
  achWebUrl?: string;
}

export interface INFTCheckoutByACH extends IBaseNFTCheckoutProps {
  merchantName?: `${MerchantNameEnum.Alchemy}`;
  language?: string;
}

export interface INFTCheckoutFinishResult {
  status: 'success' | 'cancel' | 'pending' | 'fail';
  data: {
    orderId: string;
  };
}

export interface INFTCheckout {
  nftCheckout(params: INFTCheckoutByACH): Promise<INFTCheckoutFinishResult>;
}
