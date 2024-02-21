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
import OpenLogin from './openlogin';
import { facebookAuthPath, twitterAuthPath } from './openlogin/contants';

export const socialLoginAuthOpen = ({
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
  new Promise((resolve, reject) => {
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

    const thirdPage = ctw === 'Offline' ? WEB_PAGE_TEST : WEB_PAGE;

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

export const socialLoginAuth = async ({
  type,
  clientId,
}: {
  type: ISocialLogin;
  clientId?: string;
  redirectURI?: string;
  network?: NetworkType;
  serviceUrl?: string;
}): Promise<{
  token: string;
  provider: ISocialLogin;
}> => {
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

  const result = await openlogin.login({
    from: 'openlogin',
    loginProvider: type,
  });
  if (!result) throw 'Not result';
  if (result?.code) throw result.message;
  console.log(result, 'result===');
  return result;
};
