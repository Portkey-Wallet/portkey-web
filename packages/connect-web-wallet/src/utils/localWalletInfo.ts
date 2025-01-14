import { CWW_WALLET_INFO_KEY } from '../constants';

export type TWalletInfo = {
  caHash?: string;
  caAddress?: string;
  nickName?: string;
  managerAddress?: string;
  managerPubkey?: string;
};

export class WalletInfoControl {
  static getWalletInfo() {
    const info = localStorage.getItem(CWW_WALLET_INFO_KEY);
    if (!info) throw 'no wallet info';
    return JSON.parse(info);
  }

  static setWalletInfo(walletInfo: TWalletInfo) {
    return localStorage.setItem(CWW_WALLET_INFO_KEY, JSON.stringify(walletInfo));
  }

  static resetWalletInfo() {
    return localStorage.removeItem(CWW_WALLET_INFO_KEY);
  }
}
