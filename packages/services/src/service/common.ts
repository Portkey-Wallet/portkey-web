import { IBaseRequest } from '@portkey/types';
import { BaseService } from '../types';
import { TCommonService } from '../types/common';

export class Common<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements TCommonService {
  saveData(params: Record<string, any>): Promise<string> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/tab/complete',
      headers: {
        Accept: 'text/plain;v=1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  }
}
