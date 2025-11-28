import { TWalletInfo, WalletInfoControl } from './localWalletInfo';

export const getCachedWalletInfo = (): TWalletInfo => WalletInfoControl.getWalletInfo();
