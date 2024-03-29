import { PORTKEY_SIGN_IN_STORAGE_KEY_TELEGRAM, PORTKEY_SIGN_UP_STORAGE_KEY_TELEGRAM } from './storage';

export const Portkey_Bot_Webapp = 'https://t.me/Lucky_V5_Bot/lucky666';
export const Dapp_Bot_Webapp = 'https://t.me/Dapp_V5_Bot/dappv5';

export enum Telegram_Link_Params {
  GetAuthToken = 'GetAuthToken',
  CanGetAuthToken = 'CanGetAuthToken',
}

export const Open_Login_Bridge = 'http://localhost:3002';
export const Open_Login_Guardian_Bridge = 'http://localhost:3002/guardian';
export const Open_Login_Guardian_Approval_Bridge = 'http://localhost:3002/guardian/approval';

export const Telegram_Login_Storage_key = [PORTKEY_SIGN_IN_STORAGE_KEY_TELEGRAM, PORTKEY_SIGN_UP_STORAGE_KEY_TELEGRAM];
