import { aelf } from '@portkey/utils';
export const COMMON_PRIVATE = 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71';

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const commonAccount = aelf.getWallet(COMMON_PRIVATE);
export const portkeyDidUIPrefix = '@portkey/did-ui-sdk:';

export const WEB_PAGE = 'https://openlogin.portkey.finance';
// export const WEB_PAGE = 'https://openlogin-test.portkey.finance';
// export const WEB_PAGE = 'http://localhost:3000';
