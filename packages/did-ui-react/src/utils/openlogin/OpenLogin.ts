import PopupHandler, { PopupResponse } from './PopupHandler';
import { OPENLOGIN_ACTIONS, UX_MODE, openLoginRedirectURI } from './contants';
import { LoginParams, OpenLoginOptions, OpenloginParamConfig } from './types';
import { WEB_PAGE, WEB_PAGE_TEST } from '../../constants';
import { dealURLLastChar, randomId } from '../lib';
import { constructURL, jsonToBase64 } from './utils';
import { ISocialLogin } from '../../types';
import { forgeWeb } from '@portkey/utils';
import { TOpenLoginGuardianLocationState } from '../../types/openlogin';
import { CrossTabPushMessageType } from '@portkey/socket';

class OpenLogin {
  options: OpenLoginOptions;

  constructor(options: OpenLoginOptions) {
    if (!options.network) options.network = 'onLine';

    if (!options.sdkUrl) {
      if (options.network === 'local') options.sdkUrl = 'http://localhost:3000';
      if (options.network === 'offline') options.sdkUrl = WEB_PAGE_TEST;
      if (options.network === 'onLine') options.sdkUrl = WEB_PAGE;
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
    return `${this.serviceURI}/ca`;
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

    const dataObject: OpenloginParamConfig = {
      clientId: this.options.clientId,
      ...params,
      actionType: OPENLOGIN_ACTIONS.LOGIN,
      serviceURI: this.serviceURI,
    };
    console.log(dataObject, 'dataObject==');
    const result = await this.openloginHandler(`${this.baseUrl}/social-start`, dataObject, [
      CrossTabPushMessageType.onAuthStatusChanged,
    ]);
    if (!result) return null;
    if (this.options.uxMode === UX_MODE.REDIRECT) return null;
    return result;
  }

  async getLoginId(): Promise<string> {
    const loginId = randomId();

    return loginId;
  }

  async openloginHandler(
    url: string,
    queryParams: OpenloginParamConfig | TOpenLoginGuardianLocationState,
    socketMethod: Array<CrossTabPushMessageType>,
    popupTimeout = 1000,
  ): Promise<PopupResponse | undefined> {
    const loginId = await this.getLoginId();

    queryParams.loginId = loginId;
    queryParams.network = this.options.network;

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

      socketMethod.forEach((item) => {
        currentWindow
          .listenOnChannel(loginId, item)
          .then(async (res) => {
            const decrypted = await cryptoManager.decryptLong(keyPair.privateKey, res);
            let result;

            try {
              result = JSON.parse(decrypted);
            } catch (error) {
              result = decrypted;
            }
            resolve(result);
          })
          .catch(reject);
      });

      currentWindow.on('socket-connect', () => {
        try {
          currentWindow.open();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

export default OpenLogin;
