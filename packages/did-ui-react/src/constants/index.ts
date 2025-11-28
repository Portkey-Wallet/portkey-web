import { aelf } from '@portkey/utils';

export const COMMON_ACCOUNT = aelf.createNewWallet();

export const COMMON_PRIVATE = COMMON_ACCOUNT.privateKey;

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const portkeyDidUIPrefix = '@portkey/did-ui-sdk:';
export const PORTKEY_PREFIX_CLS = 'portkey-ant';
export const PORTKEY_ICON_PREFIX_CLS = 'anticon';
export const PORTKEY_ROOT_ID = 'portkey-ui-root';
export const PORTKEY_VERSION = 'v2';
export const PORTKEY_Z_INDEX = 10010;

export const PIC_SMALL_SIZE = 144;
export const PIC_MIDDLE_SIZE = 294;
export const PIC_LARGE_SIZE = 1008;

export const PAGESIZE_10 = 10;

export const DEFAULT_AMOUNT = 0;
export const DEFAULT_DECIMAL = 8;
export const DEFAULT_NFT_DECIMAL = 0;
export const DEFAULT_DIGITS = 4;

export const ALLOWANCE_MAX_LIMIT = '9000000000000000000';

export const WEB_PAGE = 'https://openlogin.portkey.finance';
export const WEB_PAGE_TESTNET = 'https://openlogin-testnet.portkey.finance';
export const WEB_PAGE_TEST = 'https://openlogin-test.portkey.finance';

// export const WEB_PAGE = 'http://localhost:3000';

export const loginOptTip = `Synchronising data on the blockchain. Please try again in 30 seconds.`;

export const CROSS_CHAIN_ETRANSFER_SUPPORT_SYMBOL = ['ELF', 'USDT'];
