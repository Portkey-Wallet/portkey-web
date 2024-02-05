import { aelf } from '@portkey/utils';
export const COMMON_PRIVATE = 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71';

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const commonAccount = aelf.getWallet(COMMON_PRIVATE);
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

export const ALLOWANCE_MAX_LIMIT = '9223372036854774784';

export const WEB_PAGE = 'https://openlogin.portkey.finance';
// export const WEB_PAGE = 'https://openlogin-test.portkey.finance';
export const WEB_PAGE_TEST = 'https://openlogin-test.portkey.finance';

// export const WEB_PAGE = 'http://localhost:3000';
