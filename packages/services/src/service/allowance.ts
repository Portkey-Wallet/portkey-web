import { IBaseRequest } from '@portkey/types';
import { BaseService, GetAllowanceParams, GetAllowanceResult, IAllowanceService } from '../types';

export class Allowance<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IAllowanceService {
  getAllowanceList(params: GetAllowanceParams): Promise<GetAllowanceResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/tokens/allowances',
      params,
    });
  }
}
