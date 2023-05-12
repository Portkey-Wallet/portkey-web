import { ChainInfo, RecoverStatusResult, RegisterStatusResult } from '../../src/types/search';
import { IHolderInfo, RecoveryResult, RegisterInfo, RegisterResult } from '../../src/types/communityRecovery';
import {
  SendAppleUserExtraInfoResult,
  SendVerificationCodeResult,
  VerifyVerificationCodeResult,
} from '../../src/types/verification';
import { IRequestDefaults, RequestOpts } from '@portkey/types';

class FetchRequestMock {
  protected _defaults: IRequestDefaults;
  constructor(defaults: IRequestDefaults) {
    this._defaults = defaults;
  }
  async send(config: RequestOpts): Promise<any> {
    let result;
    switch (config.url) {
      // search
      case '/api/app/search/chainsinfoindex':
        result = {
          items: [
            {
              chainId: 'AELF',
              chainName: 'chainName_mock',
              endPoint: 'endPoint_mock',
              explorerUrl: 'explorerUrl_mock',
              caContractAddress: 'caContractAddress_mock',
              lastModifyTime: 'lastModifyTime_mock',
              id: 'id_mock',
              defaultToken: {
                name: 'name_mock',
                address: 'address_mock',
                imageUrl: 'imageUrl_mock',
                symbol: 'symbol_mock',
                decimals: 'decimals_mock',
              },
            },
          ] as ChainInfo[],
        };
        break;
      case '/api/app/search/accountregisterindex':
        result = {
          items: [
            {
              caAddress: 'caAddress_mock',
              caHash: 'caHash_mock',
              registerStatus: 'pass',
              registerMessage: 'registerMessage_mock',
            },
          ] as RegisterStatusResult[],
        };
        break;
      case '/api/app/search/accountrecoverindex':
        result = {
          items: [
            {
              caAddress: 'caAddress_mock',
              caHash: 'caHash_mock',
              recoveryStatus: 'pass',
              recoveryMessage: 'recoveryMessage_mock',
            },
          ] as RecoverStatusResult[],
        };
        break;

      // communityRecovery & verification
      case '/api/app/account/guardianIdentifiers':
        result = {
          caAddress: 'caAddress_mock',
          caHash: 'caHash_mock',
          guardianList: {
            guardians: [
              {
                guardianIdentifier: 'guardianIdentifier_mock',
                identifierHash: 'identifierHash_mock',
                isLoginGuardian: true,
                salt: 'salt_mock',
                type: 'Email',
                verifierId: 'verifierId_mock',
              },
            ],
          },
          managerInfos: [
            {
              address: 'address_mock',
              extraData: 'extraData_mock',
            },
          ],
        } as IHolderInfo;
        break;
      case '/api/app/account/registerInfo':
        result = {
          originChainId: 'AELF',
        } as RegisterInfo;
        break;
      case '/api/app/account/sendVerificationRequest':
        result = {
          verifierSessionId: 'verifierSessionId_mock',
        } as SendVerificationCodeResult;
        break;
      case '/api/app/account/verifyCode':
      case '/api/app/account/verifyGoogleToken':
      case '/api/app/account/verifyAppleToken':
        result = {
          verificationDoc: 'verificationDoc_mock',
          signature: 'signature_mock',
        } as VerifyVerificationCodeResult;
        break;
      case '/api/app/account/register/request':
        result = {
          sessionId: 'sessionId_mock',
        } as RegisterResult;
        break;
      case '/api/app/account/recovery/request':
        result = {
          sessionId: 'sessionId_mock',
        } as RecoveryResult;
        break;
      case '/api/app/userExtraInfo/appleUserExtraInfo':
        result = {
          userId: 'userId_mock',
        } as SendAppleUserExtraInfoResult;
        break;
      case '/api/app/account/isGoogleRecaptchaOpen':
        result = true;
        break;
      case '/api/app/phone/info':
        result = {
          data: [{ country: 'Singapore', code: '65', iso: 'SG' }],
        };
        break;

      default:
        break;
    }
    return result;
  }
}
export default FetchRequestMock;
