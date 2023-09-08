import { IBaseRequest } from '@portkey/types';
import { BaseService, IWalletBalanceCheckResponse, IWalletBalanceCheckParams, ISecurityService } from '../types';

export class Security<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ISecurityService {
  getWalletBalanceCheck(params: IWalletBalanceCheckParams): Promise<IWalletBalanceCheckResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/user/security/balanceCheck',
      params,
    });
  }
}
