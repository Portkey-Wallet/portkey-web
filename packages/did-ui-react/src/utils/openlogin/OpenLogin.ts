import PopupHandler from './PopupHandler';
import { OPENLOGIN_ACTIONS, UX_MODE, openLoginRedirectURI } from './constants';
import { LoginParams, OpenLoginOptions, OpenloginParamConfig, PopupResponse } from './types';
import { WEB_PAGE, WEB_PAGE_TEST, WEB_PAGE_TESTNET } from '../../constants';
import { dealURLLastChar, randomId } from '../lib';
import { constructURL, jsonToBase64 } from './utils';
import { ISocialLogin } from '../../types';
import { forgeWeb } from '@portkey/utils';
import { IOpenloginHandlerResult, TOpenLoginQueryParams } from '../../types/openlogin';
import { CrossTabPushMessageType } from '@portkey/socket';
import { TelegramPlatform } from '../telegramPlatform';
import { VerifyTypeEnum, zkGuardianType } from '../../constants/guardian';
import { generateNonceAndTimestamp } from '../nonce';
import AElf from 'aelf-sdk';
import { getOperationDetails } from '../../components/utils/operation.util';
import { OperationTypeEnum } from '@portkey/services';
import { ConfigProvider } from '../../components';

class OpenLogin {
  options: OpenLoginOptions;

  constructor(options: OpenLoginOptions) {
    if (!options.customNetworkType) options.customNetworkType = 'online';

    if (!options.sdkUrl) {
      if (options.customNetworkType === 'local') options.sdkUrl = 'http://localhost:3000';
      if (options.customNetworkType === 'offline') options.sdkUrl = WEB_PAGE_TEST;
      if (options.customNetworkType === 'online')
        options.sdkUrl = options.networkType === 'TESTNET' ? WEB_PAGE_TESTNET : WEB_PAGE;
    }

    if (!options.uxMode) options.uxMode = UX_MODE.POPUP;
    if (typeof options.replaceUrlOnRedirect !== 'boolean') options.replaceUrlOnRedirect = true;
    if (!options.storageKey) options.storageKey = 'local';
    this.options = options;
  }

  get serviceURI(): string {
    return dealURLLastChar(this.options.serviceURI);
  }

  get socketURI(): string {
    if (this.options.socketURI) return dealURLLastChar(this.options.socketURI);
    return `${this.serviceURI}/communication`;
  }

  private get baseUrl(): string {
    if (this.options.sdkUrl) return `${this.options.sdkUrl}`;
    return WEB_PAGE;
  }

  getRedirectURI(loginProvider: ISocialLogin) {
    const serviceURI = this.serviceURI;
    const path = openLoginRedirectURI[loginProvider];

    return `${serviceURI}${path}`;
  }

  async login(params: LoginParams): Promise<PopupResponse | null> {
    const { loginProvider } = params;
    if (!loginProvider) throw `SocialLogin type is required`;

    let zkParams = {};
    let zkNonce = '';
    let zkTimestamp = 0;

    if (zkGuardianType.includes(params.loginProvider)) {
      const operationDetails = getOperationDetails(OperationTypeEnum.communityRecovery);
      const managerAddress = JSON.parse(operationDetails).manager;
      if (!managerAddress) {
        throw 'managerAddress is required';
      }
      const { nonce, timestamp } = generateNonceAndTimestamp(managerAddress);
      if (params.loginProvider === 'Apple') {
        /**
         * on App, nonce is hashed by framework,
         * so the server need to hash the data (timestamp+manager address) twice to verify the nonce.
         * And also, the extension need to hash the nonce again to verify the nonce.
         */
        zkNonce = AElf.utils.sha256(nonce);
      } else {
        zkNonce = nonce;
      }
      zkTimestamp = timestamp;
      zkParams = {
        nonce: zkNonce,
        socialType: VerifyTypeEnum.zklogin,
      };
    }
    const theme = ConfigProvider?.getGlobalConfig()?.theme;
    const dataObject: OpenloginParamConfig = {
      theme,
      clientId: this.options.clientId,
      ...params,
      actionType: OPENLOGIN_ACTIONS.LOGIN,
      serviceURI: this.serviceURI,
      ...zkParams,
    };
    console.log(dataObject, 'dataObject==');

    const result = await this.openloginHandler({
      url: `${this.baseUrl}/social-start`,
      queryParams: dataObject,
      socketMethod: [CrossTabPushMessageType.onAuthStatusChanged],
      needConfirm: true,
    });

    if (!result) return null;
    if (this.options.uxMode === UX_MODE.REDIRECT) return null;
    const res = Object.assign(result.data || {}, { nonce: zkNonce, timestamp: zkTimestamp });
    return res as PopupResponse;
  }

  async getLoginId(): Promise<string> {
    const loginId = randomId();

    return loginId;
  }

  async openloginHandler({
    url,
    queryParams,
    socketMethod,
    popupTimeout = 1000,
    needConfirm = false,
  }: {
    url: string;
    queryParams: TOpenLoginQueryParams;
    socketMethod: Array<CrossTabPushMessageType>;
    popupTimeout?: number;
    needConfirm?: boolean;
  }): Promise<IOpenloginHandlerResult | undefined> {
    const loginId = await this.getLoginId();

    queryParams.loginId = loginId;
    queryParams.network = this.options.customNetworkType;
    queryParams.isFromTelegram = TelegramPlatform.isTelegramPlatform();

    if (this.options.uxMode === UX_MODE.REDIRECT) {
      const loginUrl = constructURL({
        baseURL: url,
        query: { b64Params: jsonToBase64(queryParams) },
      });
      window.location.href = loginUrl;
      return undefined;
    }
    // Get publicKey and privateKey
    const cryptoManager = new forgeWeb.ForgeCryptoManager();
    const keyPair = await cryptoManager.generateKeyPair();

    queryParams.publicKey = keyPair.publicKey;
    const loginUrl = constructURL({
      baseURL: url,
      query: { b64Params: jsonToBase64(queryParams) },
    });

    const currentWindow = new PopupHandler({
      url: loginUrl,
      socketURI: this.socketURI,
      timeout: popupTimeout,
    });

    return new Promise((resolve, reject) => {
      currentWindow.on('close', () => {
        reject('User close the prompt');
      });

      currentWindow
        .listenOnChannel(loginId, socketMethod)
        .then(async (res) => {
          const decrypted = await cryptoManager.decryptLong(keyPair.privateKey, res.message);
          let result;

          try {
            result = JSON.parse(decrypted);
          } catch (error) {
            result = decrypted;
          }
          resolve({ data: result, methodName: res.methodName });
        })
        .catch(reject);
      // TODO  Invoke get result and socket listen
      // currentWindow.on('socket-connect', () => {
      //   try {
      currentWindow.open({ needConfirm });
      //   } catch (error) {
      //     reject(error);
      //   }
      // });
    });
  }
}

export default OpenLogin;
