import { ISocialLogin } from '../types';
import { stringify } from 'query-string';
// const loginUrl = 'https://openlogin.portkey.finance';
const testLoginUrl = 'https://openlogin-test.portkey.finance';
// const localLoginUrl = 'http://localhost:3000';

export const socialLoginAuth = ({
  type,
  clientId,
  redirectURI,
}: {
  type: ISocialLogin;
  clientId?: string;
  redirectURI?: string;
}): Promise<{
  token: string;
  provider: ISocialLogin;
}> =>
  new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (event.data.type === 'PortkeySocialLoginOnSuccess') {
        resolve(event.data.data);
      } else if (event.data.type === 'PortkeySocialLoginOnFailure') {
        reject(event.data.error);
      } else {
        return;
      }
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);
    window.open(`${testLoginUrl}/social-login/${type}?${stringify({ clientId, redirectURI })}`);
  });
