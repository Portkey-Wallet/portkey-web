import { ISocialLogin } from '../../types';

export const UX_MODE = {
  POPUP: 'popup',
  REDIRECT: 'redirect',
} as const;

export const OPENLOGIN_ACTIONS = {
  LOGIN: 'login',
  NFT_CHECKOUT: 'nft_checkout',
} as const;

export const twitterAuthPath = '/api/app/twitterAuth/callback';
export const facebookAuthPath = '/api/app/facebookAuth/unifyReceive';

export const appleAuthPath = '/api/app/appleAuth/unifyReceive';
export const tgAuthPath = '/api/app/telegramAuth/receive/openlogin';
export const googleAuthPath = '/api/app/googleAuth/receive/openlogin';

export const openLoginRedirectURI: { [x in ISocialLogin]: string } = {
  Apple: appleAuthPath,
  Facebook: facebookAuthPath,
  Google: googleAuthPath,
  Telegram: tgAuthPath,
  Twitter: twitterAuthPath,
};
