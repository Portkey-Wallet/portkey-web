import { WEB_WALLET_DEFAULT_STORAGE_KEY } from '../constants/wallet';

export const getWebWalletStorageKey = () => window.parent?.location?.origin ?? WEB_WALLET_DEFAULT_STORAGE_KEY;
