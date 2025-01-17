import { isNotificationEvents } from '@portkey/providers';
import { PortkeyResultType } from '../types/error';
import { WalletPageType } from '../types';
import { OpenPageService } from '../service/OpenPageService';
import { did } from '@portkey/did';
import errorHandler from '../utils/errorHandler';
import { getWebWalletStorageKey } from '../utils/wallet';
export default class PermissionController {
  whitelist: string[];
  appId: string;
  constructor({ whitelist = [], appId }: { whitelist?: string[]; appId: string }) {
    this.whitelist = whitelist;
    this.appId = appId;
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
    const walletStorage = localStorage.getItem(getWebWalletStorageKey(this.appId));
    console.log('this.appId', this.appId, getWebWalletStorageKey(this.appId), walletStorage);
    return Boolean(walletStorage);
  }

  async registerWallet(payload: any): Promise<PortkeyResultType> {
    if (this.checkCurrentNetworkIsRegister())
      return {
        error: 0,
        message: 'The current network has completed login',
      };
    // Not yet registered or logged in
    return OpenPageService.openPage({
      pageType: !!payload?.payload ? WalletPageType.CustomLogin : WalletPageType.Login,
      data: payload,
    });
  }

  checkAllowMethod(methodName: string) {
    return this.whitelist.includes(methodName) || isNotificationEvents(methodName);
  }

  async checkRegister(methodName: string, payload: any): Promise<PortkeyResultType> {
    if (this.checkAllowMethod(methodName))
      return {
        error: 0,
        message: 'no check',
      };

    console.log('checkRegister', methodName);
    return await this.registerWallet(payload);
  }
}
