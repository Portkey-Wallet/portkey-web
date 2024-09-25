import { IDIDGraphQL } from '@portkey/graphql';
import { IBaseRequest, IReferralConfig } from '@portkey/types';
import {
  GetCAHolderByManagerParams,
  GetCAHolderByManagerResult,
  GetHolderInfoParams,
  IHolderInfo,
  ICommunityRecoveryService,
  RecoveryParams,
  RecoveryResult,
  RegisterParams,
  RegisterResult,
  GetRegisterInfoParams,
  RegisterInfo,
  IPhoneCountryCodeResult,
  CheckGoogleRecaptchaParams,
  TDeletionAccountParams,
  TCheckDeletionResult,
  TDeletionEntranceResult,
  TGetCaInfoByManagerResult,
  TGetCaInfoByManagerParams,
} from '../types/communityRecovery';
import {
  GetRecommendationVerifierParams,
  VerifierItem,
  SendAppleUserExtraInfoParams,
  SendAppleUserExtraInfoResult,
  SendVerificationCodeRequestParams,
  SendVerificationCodeResult,
  VerifyAppleTokenParams,
  VerifyVerificationCodeParams,
  VerifyVerificationCodeResult,
  GetAppleUserExtraInfoParams,
  VerifierSocialTokenParams,
  VerifyTwitterTokenHeader,
  TGetTelegramAuthTokenResult,
  TGetTelegramAuthTokenParams,
  VerifyZKLoginResult,
} from '../types/verification';
import { Search } from './search';

export class CommunityRecovery<T extends IBaseRequest = IBaseRequest>
  extends Search<T>
  implements ICommunityRecoveryService
{
  public referralConfig: IReferralConfig;
  private readonly _didGraphQL: IDIDGraphQL;

  constructor(request: T, didGraphQL: IDIDGraphQL, referralConfig: IReferralConfig) {
    super(request);
    this._didGraphQL = didGraphQL;
    this.referralConfig = referralConfig;
  }
  async getPhoneCountryCodeWithLocal(): Promise<IPhoneCountryCodeResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/phone/info',
    });
  }
  checkGoogleRecaptcha(params: CheckGoogleRecaptchaParams): Promise<boolean> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/isGoogleRecaptchaOpen',
      params,
    });
  }
  getHolderInfo(params: GetHolderInfoParams): Promise<IHolderInfo> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/guardianIdentifiers',
      params,
    });
  }
  getRegisterInfo(params: GetRegisterInfoParams): Promise<RegisterInfo> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/registerInfo',
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
  register(params: RegisterParams): Promise<RegisterResult> {
    const _params = { ...params };
    if (this.referralConfig.referralInfo) _params.referralInfo = this.referralConfig.referralInfo;
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/register/request',
      params: _params,
    });
  }
  recovery(params: RecoveryParams): Promise<RecoveryResult> {
    const _params = { ...params };
    if (this.referralConfig.referralInfo) _params.referralInfo = this.referralConfig.referralInfo;
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/recovery/request',
      params: _params,
    });
  }

  async getHolderInfoByManager(params: GetCAHolderByManagerParams): Promise<GetCAHolderByManagerResult> {
    const result = await this._didGraphQL.getHolderInfoByManager(params);
    return result.caHolderManagerInfo;
  }
  /**
   * deprecated Please use `verification.sendAppleUserExtraInfo`
   */
  sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/userExtraInfo/appleUserExtraInfo',
      params,
    });
  }
  verifyZKLogin(params: any): Promise<VerifyZKLoginResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifiedzk',
      params,
    });
  }
  /**
   * deprecated Please use `verification.getAppleUserExtraInfo`
   */
  getAppleUserExtraInfo(params: GetAppleUserExtraInfoParams): Promise<any> {
    return this._request.send({
      method: 'GET',
      url: `/api/app/userExtraInfo/${params.userId}`,
    });
  }
  /**
   * deprecated Please use `verification.verifyGoogleToken`
   */
  verifyGoogleToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyGoogleToken',
      params,
    });
  }
  /**
   * deprecated Please use `verification.verifyAppleToken`
   */
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
  /**
   * deprecated Please use `verification.verifyTelegramToken`
   */
  verifyTelegramToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyTelegramToken',
      params,
    });
  }
  /**
   * deprecated Please use `verification.verifyTwitterToken`
   */
  verifyTwitterToken(
    params: VerifierSocialTokenParams,
    headers: VerifyTwitterTokenHeader,
  ): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyTwitterToken',
      params,
      headers,
    });
  }
  /**
   * deprecated Please use `verification.verifyFacebookToken`
   */
  verifyFacebookToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/verifyFacebookToken',
      params,
    });
  }
  /**
   * deprecated Please use `verification.getRecommendationVerifier`
   */
  getRecommendationVerifier(params: GetRecommendationVerifierParams): Promise<VerifierItem> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/getVerifierServer',
      params,
    });
  }
  /**
   * deprecated Please use `verification.getTelegramAuthToken`
   */
  getTelegramAuthToken(params: TGetTelegramAuthTokenParams): Promise<TGetTelegramAuthTokenResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/telegramAuth/token',
      params,
    });
  }

  getShowDeletionEntrance(): Promise<TDeletionEntranceResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/revoke/entrance',
    });
  }

  checkDeletion(): Promise<TCheckDeletionResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/account/revoke/check',
    });
  }

  deletionAccount(params: TDeletionAccountParams): Promise<any> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/revoke/request',
      params,
    });
  }

  getCaInfoByManager(params: TGetCaInfoByManagerParams): Promise<TGetCaInfoByManagerResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/manager/check',
      params,
    });
  }
}
