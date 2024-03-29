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

    // const result = {
    //   token:
    //     'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OTkwODQ4MDM3IiwiYXV0aERhdGUiOiIxNzEyNTI4NjEwIiwiZmlyc3ROYW1lIjoiQXVyb3JhIiwiaGFzaCI6ImE5NjhhNDBiMmY0MTJhMzE3ZWQxM2IwODE0ZTY4MmNlMDM0OThlNzgxZTk3MTllMWI2NzRiZTg4ZWJjMWNiMGYiLCJuYmYiOjE3MTE1MTgzOTEsImV4cCI6MTcxMTUyMTk5MSwiaXNzIjoiUG9ydEtleSIsImF1ZCI6IlBvcnRLZXkifQ.GMUVh2ZoWH0fL13sDwSKdA9Z1zcqgOKph5VZP37JmqAiUfW9gCxmpsWUhcG-ZysBhfAOG5UoP7JR8yFcgCVBT37YXF-RtA0dBl65k1W7mse1e1fUmvOgWJQY2Jdz4VMtT_JY7T6fF7SB63vNwBSNKo1GGanJPLMy4ZGVupF6TNHIiBYzvrKH-j32BS5EJ1rEB4yEsH49Y2eBpTmKDZd_mlisfM2lc5VOe5zv2cLBuUVMdAsQHYI-Dh0GZV2xbYcA_EqtHfkO7Gwjs0T-K5LCsc5EInCiScpe0lQPCMTML_4y1T-fKPMY0MTG0r6dZwq7rKDbLCMFTxS-EUDTGvuKEA',
    //   provider: 'Telegram' as ISocialLogin,
    // };

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

      currentWindow
        .listenOnChannel(loginId, socketMethod)
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
