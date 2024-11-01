import { parse } from 'query-string';
import { sleep } from '@portkey/utils';
import { TelegramWebappInitData } from '@portkey/types';
import { PORTKEY_SDK_TELEGRAM_USER_ID } from '../constants/telegram';

declare const window: Window &
  typeof globalThis & {
    Telegram?: Telegram;
  };

export class TelegramPlatform {
  static getTelegram() {
    if (typeof window === 'undefined') return null;
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
  static async initializeTelegramWebApp({
    tgUserChanged,
    initialDelay = 1000,
    needExpand = true,
  }: {
    tgUserChanged: (curUserId: string, preUserId: string) => Promise<void>;
    initialDelay?: number;
    needExpand?: boolean;
  }) {
    if (typeof window !== 'undefined') {
      await sleep(initialDelay);
      const Telegram = TelegramPlatform.getTelegram();
      if (!Telegram || !TelegramPlatform.isTelegramPlatform()) return;
      if (needExpand) {
        Telegram.WebApp.expand();
      }

      const currentTelegramUserId = TelegramPlatform.getTelegramUserId();
      const preTelegramUserId = window.localStorage.getItem(PORTKEY_SDK_TELEGRAM_USER_ID);

      if (currentTelegramUserId && currentTelegramUserId !== preTelegramUserId) {
        preTelegramUserId && (await tgUserChanged(currentTelegramUserId, preTelegramUserId));
        window.localStorage.setItem(PORTKEY_SDK_TELEGRAM_USER_ID, currentTelegramUserId);
      }
      Telegram.WebApp.ready();
    }
  }
}
