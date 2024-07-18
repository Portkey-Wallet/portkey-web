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
      case '/api/app/search/caholderindex':
        result = {
          items: [
            {
              userId: 'userId_mock',
              caAddress: 'caAddress_mock',
              caHash: 'caHash_mock',
              id: 'id_mock',
              nickName: 'nickName_mock',
            },
          ],
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
      case '/api/app/account/verifyTelegramToken':
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
      case '/api/app/userExtraInfo/string':
        result = {
          userId: 'userId_mock',
        } as SendAppleUserExtraInfoResult;
        break;
      case '/api/app/account/isGoogleRecaptchaOpen':
        result = true;
        break;
      case '/api/app/phone/info':
        result = {
          locateData: { country: 'Singapore', code: '65', iso: 'SG' },
          data: [{ country: 'Singapore', code: '65', iso: 'SG' }],
        };
        break;
      case '/api/app/account/getVerifierServer':
        result = {
          id: 'id_mock',
          name: 'name_mock',
          imageUrl: 'imageUrl_mock',
        };
        break;

      // connect
      case '/connect/token':
        result = {
          access_token: 'access_token_mock',
          token_type: 'token_type_mock',
          expires_in: 'expires_in_mock',
        };
        break;

      // ramp
      case '/api/app/thirdPart/alchemy/fiatList':
        result = {
          data: [
            {
              currency: 'USD',
              country: 'US',
              payWayCode: 'credit_card',
              payWayName: 'Credit Card',
              fixedFee: 0,
              rateFee: 1,
              payMin: 10,
              payMax: 10000,
            },
          ],
          returnCode: '0000',
        };
        break;
      case '/api/app/thirdPart/alchemy/cryptoList':
        result = {
          data: [
            {
              crypto: 'crypto_mock',
              network: 'network_mock',
              buyEnable: 'buyEnable_mock',
              sellEnable: 'sellEnable_mock',
              minPurchaseAmount: 10,
              maxPurchaseAmount: 100,
              address: null,
              icon: 'icon_mock',
              minSellAmount: 20,
              maxSellAmount: 200,
            },
          ],
          returnCode: '0000',
        };
        break;
      case '/api/app/thirdPart/alchemy/order/quote':
        result = {
          data: {
            crypto: 'crypto_mock',
            cryptoPrice: '200',
            cryptoQuantity: '1',
            fiat: 'USD',
            rampFee: '0',
            networkFee: '0',
            fiatQuantity: '200',
          },
          returnCode: '0000',
        };
        break;
      case '/api/app/thirdPart/alchemy/token':
        result = {
          data: {
            id: 'id_mock',
            email: 'email_mock',
            accessToken: 'accessToken_mock',
          },
          returnCode: '0000',
        };
        break;
      case '/api/app/thirdPart/order':
        result = {
          id: 'order_no_mock',
          success: true,
        };
        break;
      case '/api/app/thirdPart/alchemy/signature':
        result = {
          signature: 'signature_mock',
          returnCode: '0000',
        };
        break;
      case '/api/app/thirdPart/alchemy/transaction':
        result = {};
        break;

      // token
      case '/api/app/account/transactionFee':
        result = [
          {
            chainId: 'AELF',
            transactionFee: {
              ach: 0.01,
              crossChain: 0.01,
              max: 0.01,
            },
          },
        ];
        break;

      // assets
      case '/api/app/user/assets/token':
        result = {
          data: [
            {
              decimals: 8,
              symbol: 'ELF',
              tokenContractAddress: 'tokenContractAddress_mock',
              balance: '100000000',
              chainId: 'AELF',
              balanceInUsd: 1,
              imageUrl: 'imageUrl_mock',
              price: 1,
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/user/assets/symbolImages':
        result = {
          symbolImages: {
            ELF: 'imageUrl_mock',
          },
        };
        break;
      case '/api/app/user/assets/nftCollections':
        result = {
          data: [
            {
              chainId: 'AELF',
              collectionName: 'collectionName_mock',
              imageUrl: 'imageUrl_mock',
              itemCount: 1,
              symbol: 'symbol_mock',
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/user/assets/nftItems':
        result = {
          data: [
            {
              alias: 'alias_mock',
              balance: '100000000',
              chainId: 'AELF',
              imageLargeUrl: 'imageLargeUrl_mock',
              imageUrl: 'imageUrl_mock',
              symbol: 'symbol_mock',
              tokenContractAddress: 'tokenContractAddress_mock',
              tokenId: 'tokenId_mock',
              totalSupply: '1',
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/tokens/prices':
        result = {
          items: [
            {
              symbol: 'ELF',
              priceInUsd: 1,
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/search/usertokenindex':
        result = {
          items: [
            {
              isDisplay: true,
              isDefault: true,
              id: 'id_mock',
              token: {
                chainId: 'AELF',
                decimals: 8,
                address: 'address_mock',
                symbol: 'ELF',
                id: 'id_mock',
              },
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/user/assets/searchUserAssets':
        result = {
          data: [
            {
              chainId: 'AELF',
              symbol: 'ELF',
              address: 'address_mock',
              tokenInfo: {
                balance: '100000000',
                decimals: '8',
                balanceInUsd: '1',
                tokenContractAddress: 'tokenContractAddress_mock',
              },
            },
          ],
          totalRecordCount: 1,
        };
        break;

      // activity
      case '/api/app/user/activities/activities':
      case '/api/app/user/activities/transactions':
        result = {
          data: [
            {
              transactionType: 'Transfer',
              from: 'from_mock',
              to: 'to_mock',
              fromAddress: 'fromAddress_mock',
              toAddress: 'toAddress_mock',
              fromChainId: 'AELF',
              toChainId: 'AELF',
              status: 'status_mock',
              transactionId: 'transactionId_mock',
              blockHash: 'blockHash_mock',
              timestamp: 'timestamp_mock',
              isReceived: true,
              amount: '100000000',
              symbol: 'ELF',
              transactionFees: [
                {
                  symbol: 'ELF',
                  fee: 0.01,
                  feeInUsd: '0.01',
                  decimals: '8',
                },
              ],
            },
          ],
          totalRecordCount: 1,
        };
        break;
      case '/api/app/user/activities/activity':
        result = {
          transactionType: 'Transfer',
          from: 'from_mock',
          to: 'to_mock',
          fromAddress: 'fromAddress_mock',
          toAddress: 'toAddress_mock',
          fromChainId: 'AELF',
          toChainId: 'AELF',
          status: 'status_mock',
          transactionId: 'transactionId_mock',
          blockHash: 'blockHash_mock',
          timestamp: 'timestamp_mock',
          isReceived: true,
          amount: '100000000',
          symbol: 'ELF',
          transactionFees: [
            {
              symbol: 'ELF',
              fee: 0.01,
              feeInUsd: '0.01',
              decimals: '8',
            },
          ],
        };
        break;

      // security
      case '/api/app/user/security/balanceCheck':
        result = {
          isSafe: true,
        };
        break;
      case '/api/app/user/security/transferLimit':
        result = {
          data: [
            {
              chainId: 'AELF',
              symbol: 'ELF',
              singleLimit: '100000000',
              dailyLimit: '100000000',
              restricted: true,
              decimals: '8',
            },
          ],
          totalRecordCount: 1,
        };
        break;

      // transaction
      case '/api/app/user/assets/recentTransactionUsers':
        result = {
          data: [
            {
              chainId: 'AELF',
              caAddress: 'caAddress_mock',
              address: 'address_mock',
              addressChainId: 'AELF',
              transactionTime: 'transactionTime_mock',
              addresses: [
                {
                  chainId: 'AELF',
                  address: 'address_mock',
                },
              ],
            },
          ],
          totalRecordCount: 1,
        };
        break;

      default:
        break;
    }
    return result;
  }
}
export default FetchRequestMock;
