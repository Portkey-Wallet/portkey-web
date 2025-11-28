export interface IPortkeyWindow {
  open: Window['open'];
  close: Window['close'];
  isTelegramPlatform: () => boolean;
}
