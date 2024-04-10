import { parse } from 'query-string';

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

  static getStartParam(): { startParam?: string } {
    let startParam;
    const initData = TelegramPlatform.getWebApp()?.initData;
    try {
      if (initData) startParam = parse(initData)?.start_param as string;
    } catch (error) {
      startParam = initData;
    }
    return { startParam };
  }
}
