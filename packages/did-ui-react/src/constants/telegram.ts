import { NetworkType, TCustomNetworkType } from '../types';
import { TOpenLoginBridgeURL } from '../types/openlogin';

export const Portkey_Bot_Webapp: {
  [key in TCustomNetworkType]: {
    [key in NetworkType]: string;
  };
} = {
  onLine: {
    MAINNET: '',
    TESTNET: 'https://t.me/Lucky_V5_Bot/lucky666',
  },
  offline: {
    MAINNET: 'https://t.me/sTestABot/aelf', //test4
    TESTNET: 'https://t.me/Lucky_V5_Bot/lucky666',
  },
  local: {
    MAINNET: 'https://t.me/sTestABot/aelf',
    TESTNET: 'https://t.me/sTestABot/aelf',
  },
  // TODO tg
};

export enum Telegram_Link_Params {
  GetAuthToken = 'GetAuthToken',
  CanGetAuthToken = 'CanGetAuthToken',
}

export const Open_Login_Bridge: TOpenLoginBridgeURL = {
  onLine: 'https://openlogin.portkey.finance',
  offline: 'https://openlogin-test.portkey.finance',
  local: 'http://localhost:3002',
};

export const Open_Login_Guardian_Bridge: TOpenLoginBridgeURL = {
  onLine: Open_Login_Bridge.onLine + '/guardian',
  offline: Open_Login_Bridge.offline + '/guardian',
  local: Open_Login_Bridge.local + '/guardian',
};
export const Open_Login_Guardian_Approval_Bridge: TOpenLoginBridgeURL = {
  onLine: Open_Login_Bridge.onLine + '/guardian/approval',
  offline: Open_Login_Bridge.offline + '/guardian/approval',
  local: Open_Login_Bridge.local + '/guardian/approval',
};
