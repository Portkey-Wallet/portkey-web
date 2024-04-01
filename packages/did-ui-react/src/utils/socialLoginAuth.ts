import {
  getCustomNetworkType,
  getServiceUrl,
  getSocketUrl,
  getStorageInstance,
} from '../components/config-provider/utils';
import { WEB_PAGE, WEB_PAGE_TEST } from '../constants';
import { ISocialLogin, NetworkType } from '../types';
import { stringify } from 'query-string';
import { dealURLLastChar } from './lib';
import { devicesEnv } from '@portkey/utils';
import OpenLogin from './openlogin';
import { facebookAuthPath, twitterAuthPath } from './openlogin/constants';
import { isTelegramPlatform, saveDataWithInTelegram } from './telegram';

export const socialLoginAuthOpener = ({
  type,
  clientId,
  redirectURI,
  network,
  serviceUrl,
}: {
  type: ISocialLogin;
  clientId?: string;
  redirectURI?: string;
  network?: NetworkType;
  serviceUrl?: string;
}): Promise<{
  token: string;
  provider: ISocialLogin;
}> =>
  new Promise(async (resolve, reject) => {
    let timer: any = null;
    let serviceURI = dealURLLastChar(serviceUrl);
    let _redirectURI = redirectURI;

    if ((type === 'Telegram' || type === 'Facebook' || type === 'Twitter') && !serviceURI) serviceURI = getServiceUrl();
    if (!redirectURI) {
      switch (type) {
        case 'Facebook':
          _redirectURI = `${serviceURI}${facebookAuthPath}`;
          break;
        case 'Twitter':
          _redirectURI = `${serviceURI}${twitterAuthPath}`;
          break;
      }
    }

    const ctw = getCustomNetworkType();

    let thirdPage;
    switch (ctw) {
      case 'offline':
        thirdPage = WEB_PAGE_TEST;
        break;
      case 'onLine':
        thirdPage = WEB_PAGE;
        break;

      case 'local':
        thirdPage = 'http://localhost:3000';
        break;
      default:
        thirdPage = WEB_PAGE;
    }

    const app = await devicesEnv.getPortkeyShellApp();

    if (app) {
      return app.invokeClientMethod(
        {
          type: 'login',
          params: {
            type,
            ctw: ctw === 'offline' ? 'offline' : ctw,
            serviceURI,
          },
        },
        (args): any => {
          if (args.status === 1) {
            const token = args.data?.token;
            if (!token) {
              reject('auth error');
            } else {
              resolve({
                token,
                provider: type,
              });
            }
          } else {
            reject(args.msg || 'auth error');
          }
        },
      );
    }

    const onMessage = (event: MessageEvent) => {
      const type = event.data.type;
      if (type === 'PortkeySocialLoginOnSuccess' || type === 'PortkeySocialLoginOnFailure') {
        timer && clearInterval(timer);
      }
      switch (type) {
        case 'PortkeySocialLoginOnSuccess':
          resolve(event.data.data);
          break;
        case 'PortkeySocialLoginOnFailure':
          reject(event.data.error);
          break;
        default:
          return;
      }
      window.removeEventListener('message', onMessage);
    };

    window.addEventListener('message', onMessage);
    const baseUrl = `${thirdPage}/social-login/${type}`;
    const encode = !(type === 'Twitter' || type === 'Facebook');
    const queryParams =
      type === 'Telegram'
        ? {
            network,
            from: 'openlogin',
            serviceURI,
          }
        : {
            clientId,
            redirectURI: _redirectURI,
            // version: PORTKEY_VERSION
          };

    console.log(`${baseUrl}?${stringify(queryParams, { encode })}`, '=====baseUrl');
    const windowOpener = window.open(`${baseUrl}?${stringify(queryParams, { encode })}`);

    timer = setInterval(() => {
      if (windowOpener?.closed) {
        clearInterval(timer);
        reject('User close the prompt');
        timer = null;
      }
    }, 1600);
  });

export const socialLoginAuthBySocket = async ({
  type,
  clientId,
  paramForTelegram,
}: {
  type: ISocialLogin;
  clientId?: string;
  redirectURI?: string;
  network?: NetworkType;
  serviceUrl?: string;
  paramForTelegram?: any;
}): Promise<{
  token: string;
  provider: ISocialLogin;
} | void> => {
  const serviceURI = getServiceUrl();
  const socketURI = getSocketUrl();

  const openlogin = new OpenLogin({
    network: getCustomNetworkType(),
    serviceURI: serviceURI,
    clientId,
    socketURI,
    currentStorage: getStorageInstance(),
    // sdkUrl: 'http://localhost:3000',
  });

  // check platform
  const app = await devicesEnv.getPortkeyShellApp();
  if (app) {
    return new Promise(async (resolve, reject) => {
      const ctw = getCustomNetworkType();
      return app.invokeClientMethod(
        {
          type: 'login',
          params: {
            type,
            ctw: ctw === 'offline' ? 'offline' : ctw,
            serviceURI,
          },
        },
        (args): any => {
          if (args.status === 1) {
            const token = args.data?.token;
            if (!token) {
              reject('auth error');
            } else {
              resolve({
                token,
                provider: type,
              });
            }
          } else {
            reject(args.msg || 'auth error');
          }
        },
      );
    });
  }

  if (type === 'Telegram' && isTelegramPlatform()) {
    await saveDataWithInTelegram(paramForTelegram);
    return;
  }

  const result = await openlogin.login({
    from: 'openlogin',
    loginProvider: type,
  });
  if (!result) throw 'Not result';
  if (result?.code) throw result.message;
  console.log(result, 'result===');
  return result;
};

export const socialLoginAuth = socialLoginAuthBySocket;
