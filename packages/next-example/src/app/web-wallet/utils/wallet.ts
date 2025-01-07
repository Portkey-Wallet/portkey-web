import { WEB_WALLET_DEFAULT_STORAGE_KEY } from '../constants/wallet';

export const getWebWalletStorageKey = (appId?: string) =>
  `${WEB_WALLET_DEFAULT_STORAGE_KEY}:${appId ?? 'wallet-appId'}`;
