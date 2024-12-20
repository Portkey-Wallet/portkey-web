import { IBaseRequest } from '@portkey/types';
import {
  BaseService,
  IReceiveService,
  GetReceiveNetworkListParams,
  TReceiveNetworkListResponse,
  GetDepositInfoParams,
  TReceiveDepositInfoResponse,
} from '../types';

export class Receive<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IReceiveService {
  getReceiveNetworkList(params: GetReceiveNetworkListParams): Promise<TReceiveNetworkListResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transfer/getReceiveNetworkList',
      params,
    });
  }

  getDepositInfo(params: GetDepositInfoParams, headers: Record<string, string>): Promise<TReceiveDepositInfoResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transfer/deposit/info',
      params,
      headers,
    });
  }
}
