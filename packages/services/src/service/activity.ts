import { ActivityItemType, IBaseRequest } from '@portkey/types';
import {
  BaseService,
  IActivityService,
  IActivitiesApiResponse,
  IActivitiesApiParams,
  IActivityApiParams,
  IActivityListWithAddressApiParams,
} from '../types';

export class Activity<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IActivityService {
  getActivityList(params: IActivitiesApiParams): Promise<IActivitiesApiResponse> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/activities/activities',
      params,
    });
  }

  getActivityDetail(params: IActivityApiParams): Promise<ActivityItemType> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/activities/activity',
      params,
    });
  }
  getRecentContactActivities(params: IActivityListWithAddressApiParams): Promise<IActivitiesApiResponse> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/activities/transactions',
      params,
    });
  }
}
