import { IBaseRequest } from '@portkey/types';

import { BaseService } from '../../types';
import {
  IAwakenService,
  TGetAwakenGasFeeResult,
  TGetAwakenTokenPriceParams,
  TGetAwakenTokenPriceResult,
  TGetSwapRoutesParams,
  TGetSwapRoutesResult,
} from './types';

export class AwakenService<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IAwakenService {
  getSwapRoutes(params: TGetSwapRoutesParams): Promise<TGetSwapRoutesResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/route/best-swap-routes',
      params,
    });
  }

  getAwakenGasFee(): Promise<TGetAwakenGasFeeResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transaction-fee',
    });
  }
  getAwakenTokenPrice(params: TGetAwakenTokenPriceParams): Promise<TGetAwakenTokenPriceResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/token/price',
      params,
    });
  }
}
