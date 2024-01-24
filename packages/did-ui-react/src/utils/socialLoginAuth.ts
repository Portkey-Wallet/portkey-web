import { PORTKEY_VERSION, WEB_PAGE } from '../constants';
import { ISocialLogin, NetworkType } from '../types';
import { stringify } from 'query-string';

export const socialLoginAuth = ({
  type,
  clientId,
  redirectURI,
  network,
}: {
  type: ISocialLogin;
  clientId?: string;
  redirectURI?: string;
  network?: NetworkType;
}): Promise<{
  token: string;
  provider: ISocialLogin;
}> =>
  new Promise((resolve, reject) => {
    let timer: any = null;

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
    const baseUrl = `${WEB_PAGE}/social-login/${type}`;
    const queryParams =
      type === 'Telegram'
        ? {
            network,
            from: 'openlogin',
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
