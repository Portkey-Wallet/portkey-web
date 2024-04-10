import { TelegramPlatform } from '../telegramPlatform';

export default class PortkeyOpener {
  static isTelegramPlatform = () => {
    return TelegramPlatform.isTelegramPlatform();
  };

  static open: Window['open'] = (url = '', ...args) => {
    return PortkeyOpener.isTelegramPlatform() ? TelegramPlatform.openLink(url) : window.open(...args);
  };

  static close: Window['close'] = () => {
    return PortkeyOpener.isTelegramPlatform() ? window.close() : TelegramPlatform.close();
  };
}
