import { IBaseRequest } from '@portkey-v1/types';
import { BaseService } from '../types';
import {
  CAHolderInfo,
  ChainInfo,
  ISearchService,
  QueryOptions,
  RecoverStatusResult,
  RegisterStatusResult,
} from '../types/search';
import { sleep } from '@portkey-v1/utils';

const DefaultQueryOptions: QueryOptions = {
  interval: 5000,
  reCount: 0,
  maxCount: 20,
};
const searchMethod = 'GET';
export class Search<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements ISearchService {
  async getChainsInfo(): Promise<ChainInfo[]> {
    const req = await this._request.send({
      method: searchMethod,
      url: '/api/app/search/chainsinfoindex',
    });
    return req.items;
  }
  async getRegisterStatus(id: string, options = DefaultQueryOptions): Promise<RegisterStatusResult> {
    if (options.reCount > options.maxCount) throw new Error('timeout');
    const req = await this._request.send({
      method: searchMethod,
      url: '/api/app/search/accountregisterindex',
      params: {
        filter: `_id:${id}`,
      },
    });
    const result: RegisterStatusResult = req.items[0];
    if (!result || result.registerStatus === 'pending') {
      await sleep(options.interval);
      return this.getRegisterStatus(id, { ...options, reCount: ++options.reCount });
    }
    return result;
  }
  async getRecoverStatus(id: string, options = DefaultQueryOptions): Promise<RecoverStatusResult> {
    if (options.reCount > options.maxCount) throw new Error('timeout');
    const req = await this._request.send({
      method: searchMethod,
      url: '/api/app/search/accountrecoverindex',
      params: {
        filter: `_id:${id}`,
      },
    });
    const result: RecoverStatusResult = req.items[0];
    if (!result || result.recoveryStatus === 'pending') {
      await sleep(options.interval);
      return this.getRecoverStatus(id, { ...options, reCount: ++options.reCount });
    }
    return result;
  }
  async getCAHolderInfo(Authorization: string, caHash: string): Promise<CAHolderInfo> {
    const req = await this._request.send({
      headers: { Authorization },
      method: searchMethod,
      url: '/api/app/search/caholderindex',
      params: {
        filter: `caHash: ${caHash}`,
      },
    });
    return req.items[0];
  }
}
