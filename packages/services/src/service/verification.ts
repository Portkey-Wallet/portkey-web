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
  GetAppleUserExtraInfoParams,
  VerifyTelegramTokenParams,
  VerifyFacebookTokenParams,
  VerifyTwitterTokenParams,
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
  getAppleUserExtraInfo(params: GetAppleUserExtraInfoParams): Promise<any> {
    return this._request.send({
      method: 'GET',
      url: `/api/app/userExtraInfo/${params.userId}`,
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
  verifyTelegramToken(params: VerifyTelegramTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyTelegramToken',
      params,
    });
  }
  verifyTwitterToken(params: VerifyTwitterTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyTwitterToken',
      params,
    });
  }
  verifyFacebookToken(params: VerifyFacebookTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyFacebookToken',
      params,
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
