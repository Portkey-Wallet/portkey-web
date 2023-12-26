import { IBaseRequest } from '@portkey-v1/types';
import {
  BaseService,
  IWalletBalanceCheckResponse,
  IWalletBalanceCheckParams,
  ISecurityService,
  IPaymentSecurityListParams,
  IPaymentSecurityListResponse,
} from '../types';

export class Security<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ISecurityService {
  getWalletBalanceCheck(params: IWalletBalanceCheckParams): Promise<IWalletBalanceCheckResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/user/security/balanceCheck',
      params,
    });
  }

  getPaymentSecurityList(params: IPaymentSecurityListParams): Promise<IPaymentSecurityListResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/user/security/transferLimit',
      params,
    });
  }
}
