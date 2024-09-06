import { IBaseRequest } from '@portkey/types';
import { BaseService, SendSecondaryVerificationCodeRequestParams } from '../types';
import {
  TCheckVerifierResult,
  TCommonService,
  TSaveDataApiParams,
  TSecondaryMail,
  TSecondaryMailCheckParams,
  TVerifierResult,
} from '../types/common';

export class Common<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements TCommonService {
  saveData(params: TSaveDataApiParams): Promise<string> {
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
  getSecondaryMail(): Promise<TSecondaryMail> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/secondary/email',
    });
  }
  verifySecondaryMail(params: SendSecondaryVerificationCodeRequestParams): Promise<TVerifierResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/secondary/email/verify',
      ...params,
    });
  }
  checkSecondaryMail(params: TSecondaryMailCheckParams): Promise<TCheckVerifierResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyCode/secondary/email',
      params,
    });
  }
  setSecondaryMail(params: TVerifierResult): Promise<string> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/set/secondary/email',
      params,
    });
  }
}
