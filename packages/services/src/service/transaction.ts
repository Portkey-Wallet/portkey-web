import { IBaseRequest } from '@portkey-v1/types';
import { BaseService, RecentTransactionResponse, ITransactionService, GetRecentTransactionParams } from '../types';

export class Transaction<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ITransactionService {
  getRecentTransactionUsers(params: GetRecentTransactionParams): Promise<RecentTransactionResponse> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/recentTransactionUsers',
      params,
    });
  }
}
