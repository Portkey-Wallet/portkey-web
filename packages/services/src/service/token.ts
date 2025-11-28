import { IBaseRequest } from '@portkey/types';
import { BaseService } from '../types';

import { FetchTxFeeParams, FetchTxFeeResult, ITokenService } from '../types';

export class Token<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ITokenService {
  fetchTxFee(params: FetchTxFeeParams): Promise<FetchTxFeeResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/transactionFee',
      params,
    });
  }
}
