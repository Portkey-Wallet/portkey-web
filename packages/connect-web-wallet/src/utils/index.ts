import { TWalletInfo, WalletInfoControl } from './localWalletInfo';

export const getCacheWalletInfo = (): TWalletInfo => WalletInfoControl.getWalletInfo();
