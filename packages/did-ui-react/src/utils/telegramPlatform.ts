import { parse } from 'query-string';
import { sleep } from '@portkey/utils';
import { TelegramWebappInitData } from '@portkey/types';
import { PORTKEY_SDK_TELEGRAM_USER_ID, TELEGRAM_API_SCRIPT_ID, TELEGRAM_API_SRC } from '../constants/telegram';

declare const window: Window &
  typeof globalThis & {
    Telegram?: Telegram;
  };

export class TelegramPlatform {
  static getTelegram() {
    return window?.Telegram;
  }

  static getWebApp() {
    return TelegramPlatform.getTelegram()?.WebApp;
  }

  static isTelegramPlatform() {
    const Telegram = TelegramPlatform.getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
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

  private static async insertScript(_document: Document, id: string, scriptSrc: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let script = _document.getElementById(id) as HTMLScriptElement | null;
        if (script) {
          if (script.src === scriptSrc) {
            resolve();
            return;
          } else {
            script.remove();
          }
        }
        script = _document.createElement('script') as HTMLScriptElement;
        script.id = id;
        script.src = scriptSrc;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        _document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async initializeTelegramWebApp({
    handleLogout,
    needExpand = true,
  }: {
    handleLogout: () => Promise<void>;
    needExpand?: boolean;
  }) {
    if (typeof window !== 'undefined') {
      await TelegramPlatform.insertScript(document, TELEGRAM_API_SCRIPT_ID, TELEGRAM_API_SRC);
      const maxAttempts = 10;
      let attempts = 0;
      while (!TelegramPlatform.getTelegram() && attempts < maxAttempts) {
        await sleep(200);
        attempts++;
      }
      const Telegram = TelegramPlatform.getTelegram();
      if (!Telegram || !TelegramPlatform.isTelegramPlatform()) return;
      if (needExpand) {
        Telegram.WebApp.expand();
      }

      const currentTelegramUserId = TelegramPlatform.getTelegramUserId();
      const preTelegramUserId = window.localStorage.getItem(PORTKEY_SDK_TELEGRAM_USER_ID);
      if (currentTelegramUserId && currentTelegramUserId !== preTelegramUserId) {
        await handleLogout();
        window.localStorage.setItem(PORTKEY_SDK_TELEGRAM_USER_ID, currentTelegramUserId);
      }
      Telegram.WebApp.ready();
    }
  }
}
