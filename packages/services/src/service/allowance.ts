import { IBaseRequest } from '@portkey/types';
import {
  BaseService,
  GetAllowanceParams,
  GetAllowanceResult,
  IAllowanceService,
  ICheckSpenderValidParams,
} from '../types';

export class Allowance<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IAllowanceService {
  getAllowanceList(params: GetAllowanceParams): Promise<GetAllowanceResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/tokens/allowances',
      params,
    });
  }
  checkSpenderValid(params: ICheckSpenderValidParams): Promise<boolean> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/contracts/spenderValid',
      params,
    });
  }
}
