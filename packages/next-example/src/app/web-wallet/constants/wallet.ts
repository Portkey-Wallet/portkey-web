import { aelf } from '@portkey/utils';

export const WEB_WALLET_DEFAULT_STORAGE_KEY = 'portkey-web-wallet';
export const DEFAULT_PIN = '111111';

export const COMMON_ACCOUNT = aelf.createNewWallet();
export const COMMON_PRIVATE = COMMON_ACCOUNT.privateKey;
