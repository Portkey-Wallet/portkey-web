import { isNotificationEvents } from '@portkey/providers';
import { PortkeyResultType } from '../types/error';
import { WalletPageType } from '../types';
import { OpenPageService } from '../service/OpenPageService';
import { did } from '@portkey/did';
import errorHandler from '../utils/errorHandler';
export default class PermissionController {
  whitelist: string[];
  constructor({ whitelist = [] }: { whitelist?: string[] }) {
    this.whitelist = whitelist;
  }

  // async checkIsLock(): Promise<PortkeyResultType> {
  //   if (!pin) {
  //     if (!search) search = { from: 'sw', type: 'unlock' };
  //   }
  //   return {
  //     error: 0,
  //     message: 'Unlock',
  //   };
  // }

  async checkIsLockOtherwiseUnlock(method: string): Promise<PortkeyResultType> {
    try {
      if (this.whitelist?.includes(method))
        return {
          error: 0,
          data: { method },
          message: 'no check',
        };
      const unlocked = Boolean(did.didWallet.aaInfo.accountInfo?.caAddress);
      if (unlocked) return errorHandler(0);

      return OpenPageService.openPage({ pageType: WalletPageType.UnLock });
    } catch (error) {
      return {
        error: 500001,
        message: 'Something error',
        Error: error,
      };
    }
  }

  checkCurrentNetworkIsRegister() {
    const parentOrigin = window.parent?.location?.origin ?? 'portkey-web-wallet';
    const walletStorage = localStorage.getItem(parentOrigin);
    return Boolean(walletStorage);
  }

  async registerWallet(): Promise<PortkeyResultType> {
    if (this.checkCurrentNetworkIsRegister())
      return {
        error: 0,
        message: 'The current network has completed login',
      };
    // Not yet registered or logged in
    return OpenPageService.openPage({ pageType: WalletPageType.Login });
  }

  checkAllowMethod(methodName: string) {
    return this.whitelist.includes(methodName) || isNotificationEvents(methodName);
  }

  async checkRegister(methodName: string): Promise<PortkeyResultType> {
    if (this.checkAllowMethod(methodName))
      return {
        error: 0,
        message: 'no check',
      };
    return await this.registerWallet();
  }
}
