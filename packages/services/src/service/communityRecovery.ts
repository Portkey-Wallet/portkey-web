import { IDIDGraphQL } from '@portkey/graphql';
import { IBaseRequest } from '@portkey/types';
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
} from '../types/communityRecovery';
import {
  SendAppleUserExtraInfoParams,
  SendAppleUserExtraInfoResult,
  SendVerificationCodeRequestParams,
  SendVerificationCodeResult,
  VerifyAppleTokenParams,
  VerifyGoogleTokenParams,
  VerifyVerificationCodeParams,
  VerifyVerificationCodeResult,
} from '../types/verification';
import { Search } from './search';
export class CommunityRecovery<T extends IBaseRequest = IBaseRequest>
  extends Search<T>
  implements ICommunityRecoveryService
{
  private readonly _didGraphQL: IDIDGraphQL;

  constructor(request: T, didGraphQL: IDIDGraphQL) {
    super(request);
    this._didGraphQL = didGraphQL;
  }
  checkGoogleRecaptcha(): Promise<boolean> {
    return this._request.send({
      method: 'POST',
      url: 'api/app/account/isGoogleRecaptchaOpen',
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
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/register/request',
      params,
    });
  }
  recovery(params: RecoveryParams): Promise<RecoveryResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/account/recovery/request',
      params,
    });
  }

  async getHolderInfoByManager(params: GetCAHolderByManagerParams): Promise<GetCAHolderByManagerResult> {
    const result = await this._didGraphQL.getHolderInfoByManager(params);
    return result.caHolderManagerInfo;
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
}
