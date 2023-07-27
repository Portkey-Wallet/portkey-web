import {
  GetRecommendationVerifierParams,
  VerifierItem,
  IVerificationService,
  SendAppleUserExtraInfoParams,
  SendAppleUserExtraInfoResult,
  SendVerificationCodeRequestParams,
  SendVerificationCodeResult,
  VerifyAppleTokenParams,
  VerifyGoogleTokenParams,
  VerifyVerificationCodeParams,
  VerifyVerificationCodeResult,
} from '../types/verification';
import { BaseService, CheckGoogleRecaptchaParams } from '../types';
import { IBaseRequest } from '@portkey/types';

export class Verification<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IVerificationService
{
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/isGoogleRecaptchaOpen',
      params,
    });
  }
  getVerificationCode(requestParams: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/sendVerificationRequest',
      ...requestParams,
    });
  }
  verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyCode',
      params,
    });
  }
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/userExtraInfo/appleUserExtraInfo',
      params,
    });
  }
  verifyGoogleToken(params: VerifyGoogleTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyGoogleToken',
      params,
    });
  }
  verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyAppleToken',
      params: {
        ...params,
        accessToken: params.identityToken,
      },
    });
  }
  getRecommendationVerifier(params: GetRecommendationVerifierParams): Promise<VerifierItem> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/getVerifierServer',
      params,
    });
  }
}
