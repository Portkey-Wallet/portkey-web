import { getCustomNetworkType, getServiceUrl } from '../components/config-provider/utils';
import { PORTKEY_VERSION, WEB_PAGE, WEB_PAGE_TEST } from '../constants';
import { ISocialLogin, NetworkType } from '../types';
import { stringify } from 'query-string';
import { dealURLLastChar } from './lib';
import { devicesEnv } from '@portkey/utils';

export const socialLoginAuth = ({
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

    if (type === 'Telegram' && !serviceURI) serviceURI = getServiceUrl();
    const ctw = getCustomNetworkType();

    const thirdPage = ctw === 'Offline' ? WEB_PAGE_TEST : WEB_PAGE;

    const app = await devicesEnv.getPortkeyShellApp();

    if (app) {
      return app.invokeClientMethod(
        {
          type: 'login',
          params: {
            type,
            ctw: ctw === 'Offline' ? 'offline' : ctw,
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
    const queryParams =
      type === 'Telegram'
        ? {
            network,
            from: 'openlogin',
            serviceURI,
          }
        : { clientId, redirectURI, version: PORTKEY_VERSION };
    const windowOpener = window.open(`${baseUrl}?${stringify(queryParams)}`);

    timer = setInterval(() => {
      if (windowOpener?.closed) {
        clearInterval(timer);
        reject('User close the prompt');
        timer = null;
      }
    }, 1600);
  });
