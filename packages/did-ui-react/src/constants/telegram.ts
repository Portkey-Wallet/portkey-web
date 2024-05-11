import { WEB_PAGE, WEB_PAGE_TEST, WEB_PAGE_TESTNET } from '.';
import { TOpenLoginBridgeURL } from '../types/openlogin';

export const Open_Login_Bridge: TOpenLoginBridgeURL = {
  online: {
    MAINNET: WEB_PAGE,
    TESTNET: WEB_PAGE_TESTNET,
  },
  offline: {
    MAINNET: WEB_PAGE_TEST,
    TESTNET: WEB_PAGE_TESTNET,
  },
  local: {
    MAINNET: 'http://localhost:3002',
    TESTNET: 'http://localhost:3002',
  },
};

export const Guardian_Bridge_Pathname = '/guardian';
export const Guardian_Approval_Bridge_Pathname = '/guardian/approval';

export const Open_Login_Guardian_Bridge: TOpenLoginBridgeURL = {
  online: {
    MAINNET: Open_Login_Bridge.online.MAINNET + Guardian_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.online.TESTNET + Guardian_Bridge_Pathname,
  },
  offline: {
    MAINNET: Open_Login_Bridge.offline.MAINNET + Guardian_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.offline.TESTNET + Guardian_Bridge_Pathname,
  },
  local: {
    MAINNET: Open_Login_Bridge.local.MAINNET + Guardian_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.local.TESTNET + Guardian_Bridge_Pathname,
  },
};
export const Open_Login_Guardian_Approval_Bridge: TOpenLoginBridgeURL = {
  online: {
    MAINNET: Open_Login_Bridge.online.MAINNET + Guardian_Approval_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.online.TESTNET + Guardian_Approval_Bridge_Pathname,
  },
  offline: {
    MAINNET: Open_Login_Bridge.offline.MAINNET + Guardian_Approval_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.offline.TESTNET + Guardian_Approval_Bridge_Pathname,
  },
  local: {
    MAINNET: Open_Login_Bridge.local.MAINNET + Guardian_Approval_Bridge_Pathname,
    TESTNET: Open_Login_Bridge.local.TESTNET + Guardian_Approval_Bridge_Pathname,
  },
};

export const PORTKEY_SDK_TELEGRAM_USER_ID = 'portkey_sdk_telegram_user_id';
