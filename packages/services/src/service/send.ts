import { IBaseRequest } from '@portkey/types';
import { BaseService, ISendService, GetSendNetworkListParamsType, SendNetworkListResponseType } from '../types';

export class Send<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ISendService {
  getSendNetworkList(params: GetSendNetworkListParamsType): Promise<SendNetworkListResponseType> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transfer/getSendNetworkList',
      params,
    });
  }
}
