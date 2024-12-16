import { IBaseRequest } from '@portkey/types';
import { BaseService, IReceiveService, GetReceiveNetworkListParams, TReceiveNetworkListResponse } from '../types';

export class Receive<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IReceiveService {
  getReceiveNetworkList(params: GetReceiveNetworkListParams): Promise<TReceiveNetworkListResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transfer/getReceiveNetworkList',
      params,
    });
  }
}
