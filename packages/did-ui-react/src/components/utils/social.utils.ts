import { ISocialLogin } from '../../types';
import ConfigProvider from '../config-provider';

export const getSocialConfig = (v: ISocialLogin) => {
  const socialLogin = ConfigProvider.config.socialLogin;
  let clientId;
  let redirectURI;
  let customLoginHandler;
  switch (v) {
    case 'Apple':
    case 'Twitter':
    case 'Facebook':
      clientId = socialLogin?.[v]?.clientId;
      redirectURI = socialLogin?.[v]?.redirectURI;
      customLoginHandler = socialLogin?.[v]?.customLoginHandler;
      break;
    case 'Google':
      clientId = socialLogin?.Google?.clientId;
      customLoginHandler = socialLogin?.Google?.customLoginHandler;
      break;
    case 'Telegram':
      customLoginHandler = socialLogin?.Telegram?.customLoginHandler;
      break;
    default:
      throw 'accountType is not supported';
  }
  return { clientId, redirectURI, customLoginHandler };
};
