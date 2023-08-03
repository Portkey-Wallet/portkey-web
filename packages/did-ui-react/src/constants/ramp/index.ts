import { IAchConfig, ICurToken, ICurrencyItem, PartialFiatType, RampTypeEnum } from '../../types';
import { ChainId } from '@portkey/types';
import { countryCodeJson } from './countryCodeJson';
import { WEB_PAGE } from '..';

const getCountryCodeMap = (list: ICurrencyItem[]) => {
  const country: { [key: string]: ICurrencyItem } = {};
  list.forEach((item) => {
    country[item.iso] = item;
  });
  return country;
};

export const countryCodeList = countryCodeJson.countryCode;

export const countryCodeMap = getCountryCodeMap(countryCodeList);

export const DefaultCountry: ICurrencyItem = {
  country: 'United States',
  iso: 'US',
  icon: 'https://static.alchemypay.org/alchemypay/flag/US.png',
};

export const TOKEN_CLAIM_CONTRACT_CHAIN_ID = 'AELF' as ChainId;

export enum TransDirectEnum {
  TOKEN_BUY = 'TokenBuy',
  TOKEN_SELL = 'TokenSell',
}

// testnet
export const AchConfig: IAchConfig = {
  appId: 'f83Is2y7L425rxl8',
  baseUrl: 'https://ramptest.alchemypay.org',
  updateAchOrder: '/api/app/thirdPart/order/alchemy',
};

// mainnet
// export const AchConfig: IAchConfig = {
//   appId: 'P0e0l39jipsNYT46',
//   baseUrl: 'https://ramp.alchemypay.org',
//   updateAchOrder: '/api/app/thirdPart/order/alchemy',
// };

export const DEFAULT_CHAIN_ID = 'AELF';

export const DEFAULT_SYMBOL = 'ELF';

export const RAMP_WEB_PAGE_ROUTE = WEB_PAGE + '/third-part-bridge/';

export const RAMP_WITH_DRAW_URL = RAMP_WEB_PAGE_ROUTE + '?portkeyMethod=ACH_SELL_BACK';

export const ACH_MERCHANT_NAME = 'Alchemy';

export const FAUCET_URL = 'https://testnet-faucet.aelf.io/';

export const SELL_SOCKET_TIMEOUT = 20 * 1000;

export const BUY_SOON_TEXT = 'On-ramp is currently not supported. It will be launched in the coming weeks.';

export const SELL_SOON_TEXT = 'Off-ramp is currently not supported. It will be launched in the coming weeks.';

export const SERVICE_UNAVAILABLE_TEXT = 'Sorry, the service you are using is temporarily unavailable.';

export const DISCLAIMER_TEXT =
  'AlchemyPay is a fiat-to-crypto platform independently operated by a third-party entity. Portkey shall not be held liable for any losses or damages suffered as a result of using AlchemyPay services.';

export const INSUFFICIENT_FUNDS_TEXT = 'Insufficient funds';

export const SYNCHRONIZING_CHAIN_TEXT = 'Synchronizing on-chain account information...';

export const initToken: ICurToken = {
  crypto: 'ELF',
  network: 'ELF',
};

export const initFiat: PartialFiatType = {
  country: 'US',
  currency: 'USD',
};

export const MAX_UPDATE_TIME = 15;
export const initCurrency = '200';
export const initCrypto = '400';
export const initValueSave: {
  amount: string;
  currency: string;
  country: string;
  crypto: string;
  network: string;
  min: number | null;
  max: number | null;
  side: RampTypeEnum;
  receive: string;
  isShowErrMsg: boolean;
} = {
  amount: initCurrency,
  currency: 'USD',
  country: 'US',
  crypto: 'ELF',
  network: 'ELF',
  min: null,
  max: null,
  side: RampTypeEnum.BUY,
  receive: '',
  isShowErrMsg: false,
};

export const initPreviewData = {
  crypto: 'ELF',
  network: 'ELF',
  fiat: 'USD',
  country: 'US',
  amount: '200',
  side: RampTypeEnum.BUY,
};

export enum STAGE {
  ACHTXADS, // onAchTxAddressReceived
  TRANSACTION, // transaction
  ORDER, // onRequestOrderTransferred
}
