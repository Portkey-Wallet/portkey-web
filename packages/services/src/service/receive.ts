import { IBaseRequest } from '@portkey/types';
import {
  BaseService,
  IReceiveService,
  GetReceiveNetworkListParams,
  TReceiveNetworkListResponse,
  GetDepositInfoParams,
  TReceiveDepositInfoResponse,
  FetchTransferTokenResponse,
} from '../types';

export class Receive<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IReceiveService {
  getReceiveNetworkList(params: GetReceiveNetworkListParams): Promise<TReceiveNetworkListResponse> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/transfer/getReceiveNetworkList',
      params,
    });
  }

  fetchTransferToken(params: {
    pubkey: string;
    signature: string;
    plain_text: string;
    ca_hash: string;
    chain_id: string;
    managerAddress: string;
  }): Promise<FetchTransferTokenResponse> {
    const serializedParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      serializedParams.append(key, value);
    }

    return this._request.send({
      method: 'POST',
      url: '/api/app/transfer/connect/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: serializedParams.toString(),
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
