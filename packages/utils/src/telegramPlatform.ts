import { parse } from 'query-string';
import { TelegramWebappInitData } from '@portkey/types';

declare const window: Window &
  typeof globalThis & {
    Telegram?: any;
  };

export class TelegramPlatform {
  static getTelegram() {
    if (typeof window === 'undefined') return null;
    return window?.Telegram;
  }

  static getWebApp() {
    return TelegramPlatform.getTelegram()?.WebApp;
  }

  static async setTGScript() {
    if (typeof document === 'undefined') return;
    const tgScript = document.createElement('script');
    tgScript.src = 'https://telegram.org/js/telegram-web-app.js';
    document.body.appendChild(tgScript);

    tgScript?.addEventListener('load', () => {
      console.log('loading tg script success');
    });
  }

  static _getInitData() {
    const Telegram = TelegramPlatform.getTelegram();

    if (!Telegram) {
      let locationHash = '';
      try {
        locationHash = location.hash.toString();
      } catch (e) {
        //
      }
      TelegramPlatform.setTGScript();
      return TelegramPlatform.urlParseHashParams(locationHash);
    }
  }

  static isTelegramPlatform() {
    try {
      const Telegram = TelegramPlatform.getTelegram();
      if (!Telegram) {
        let locationHash = '';
        try {
          locationHash = location.hash.toString();
        } catch (e) {
          //
        }
        TelegramPlatform.setTGScript();
        const initParams = TelegramPlatform.urlParseHashParams(locationHash);
        const webAppPlatform = initParams?.tgWebAppPlatform;
        return webAppPlatform && webAppPlatform !== 'unknown';
      }
      return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
    } catch (error) {
      console.error('isTelegramPlatform:', error);
      return false;
    }
  }

  static urlParseHashParams(hash: string) {
    let locationHash = hash.replace(/^#/, '');
    const params: any = {};
    if (!locationHash.length) {
      return params;
    }
    if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
      params._path = TelegramPlatform.urlSafeDecode(locationHash);
      return params;
    }
    const qIndex = locationHash.indexOf('?');
    if (qIndex >= 0) {
      const pathParam = locationHash.substr(0, qIndex);
      params._path = TelegramPlatform.urlSafeDecode(pathParam);
      locationHash = locationHash.substr(qIndex + 1);
    }
    const query_params = TelegramPlatform.urlParseQueryString(locationHash);
    for (const k in query_params) {
      params[k] = query_params[k];
    }
    return params;
  }

  static urlSafeDecode(urlencoded: string) {
    try {
      urlencoded = urlencoded.replace(/\+/g, '%20');
      return decodeURIComponent(urlencoded);
    } catch (e) {
      return urlencoded;
    }
  }

  static urlParseQueryString(queryString: string) {
    const params: any = {};
    if (!queryString.length) {
      return params;
    }
    const queryStringParams = queryString.split('&');
    let i, param, paramName, paramValue;
    for (i = 0; i < queryStringParams.length; i++) {
      param = queryStringParams[i].split('=');
      paramName = TelegramPlatform.urlSafeDecode(param[0]);
      paramValue = param[1] == null ? null : TelegramPlatform.urlSafeDecode(param[1]);
      params[paramName] = paramValue;
    }
    return params;
  }

  static openLink(url: string | URL) {
    TelegramPlatform.getWebApp()?.openLink(url.toString());
    return null;
  }

  static close() {
    TelegramPlatform.getWebApp()?.close();
  }

  static getInitData() {
    let parsedInitData;
    try {
      const initData = TelegramPlatform.getWebApp()?.initData;
      if (initData) {
        parsedInitData = parse(initData) as unknown as TelegramWebappInitData;
      } else {
        parsedInitData = TelegramPlatform._getInitData();
      }
    } catch (error) {
      console.error('getInitData error: ', error);
    }
    return parsedInitData;
  }

  static getStartParam(): string | undefined {
    let startParam;
    try {
      const initData = TelegramPlatform.getInitData();
      startParam = initData?.start_param;
    } catch (error) {
      console.error('getStartParam error: ', error);
    }
    return startParam;
  }

  static getTelegramUserId(): string | undefined {
    let userId;
    try {
      const initData = TelegramPlatform.getInitData();
      if (initData?.user) {
        const userInfo = JSON.parse(initData.user);
        userId = String(userInfo.id);
      }
    } catch (error) {
      console.error('getTelegramUserId error: ', error);
    }
    return userId;
  }
}
