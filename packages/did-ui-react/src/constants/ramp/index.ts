import { ICurrencyItem } from '../../types';
import { ChainId } from '@portkey/types';
import { countryCodeJson } from './countryCodeJson';
import { WEB_PAGE } from '..';
import { ELF_SYMBOL } from '../assets';
import { MAIN_CHAIN_ID } from '../network';
import { IRampCryptoDefault, IRampFiatDefault, IRampProviderType, RampType } from '@portkey/ramp';
import { IGetBuyDetail, IGetSellDetail } from '../../components/Ramp/utils/api';

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

export enum NFTTransDirectEnum {
  NFT_BUY = 'NFTBuy',
  NFT_SELL = 'NFTSell',
}

export enum NFTCheckoutByACH {
  MARKET = 'MARKET',
  MINT = 'MINT',
}

export const ACH_NFT_CONFIG = {
  TESTNET: {
    appId: 'f83Is2y7L425rxl8', // TODO
    baseUrl: 'https://nft-sbx.alchemytech.cc',
  },
  MAINNET: {
    appId: 'P0e0l39jipsNYT46', // TODO
    baseUrl: 'https://nftcheckout.alchemypay.org',
  },
};

export const DEFAULT_CHAIN_ID = 'AELF';
export const DEFAULT_SYMBOL = 'ELF';
export const MAX_UPDATE_TIME = 15;
export const initFiatAmount = '200';
export const initCryptoAmount = '400';

export const RAMP_WEB_PAGE_ROUTE = WEB_PAGE + '/third-part-bridge/';

export const RAMP_WITH_DRAW_URL = RAMP_WEB_PAGE_ROUTE + '?portkeyMethod=ACH_SELL_BACK&version=v2';

export const ACH_MERCHANT_NAME = 'Alchemy';

export const OUR_PRODUCT_NAME = 'Portkey';

export const FAUCET_URL = 'https://testnet-faucet.aelf.io/';

export const SELL_SOCKET_TIMEOUT = 15 * 1000;

export const BUY_SOON_TEXT = 'On-ramp is currently not supported. It will be launched in the coming weeks.';

export const SELL_SOON_TEXT = 'Off-ramp is currently not supported. It will be launched in the coming weeks.';

export const SERVICE_UNAVAILABLE_TEXT = 'Sorry, the service you are using is temporarily unavailable.';

export const DISCLAIMER_TEXT =
  ' is a fiat-to-crypto platform independently operated by a third-party entity. Portkey shall not be held liable for any losses or damages suffered as a result of using ';

export const INSUFFICIENT_FUNDS_TEXT = 'Insufficient funds';

export const SYNCHRONIZING_CHAIN_TEXT = 'Synchronizing on-chain account information...';

export const SHOW_RAMP_SYMBOL_LIST = [DEFAULT_SYMBOL, 'USDT'];

export const SHOW_RAMP_CHAIN_ID_LIST = [DEFAULT_CHAIN_ID];

export const initCrypto: IRampCryptoDefault = {
  symbol: DEFAULT_SYMBOL,
  chainId: DEFAULT_CHAIN_ID,
  network: '',
  icon: '',
  amount: initFiatAmount,
};

export const initFiat: IRampFiatDefault = {
  country: 'US',
  symbol: 'USD',
  countryName: '', // TODO
  icon: '',
  amount: initCryptoAmount,
};

export const initPreviewData = {
  crypto: ELF_SYMBOL,
  network: MAIN_CHAIN_ID,
  fiat: 'USD',
  country: 'US',
  amount: initCryptoAmount,
  side: RampType.BUY,
};

export const InitProviderSelected: IGetBuyDetail | IGetSellDetail = {
  cryptoAmount: '',
  exchange: '',
  fiatAmount: '',
  amount: '',
  providerNetwork: '',
  providerSymbol: '',
  feeInfo: {
    networkFee: {
      amount: '',
      symbol: '',
      type: 'FIAT',
    },
    rampFee: {
      amount: '',
      symbol: '',
      type: 'FIAT',
    },
  },
  providerInfo: {
    appId: '',
    baseUrl: '',
    coverage: {
      buy: true,
      sell: true,
    },
    key: IRampProviderType.AlchemyPay,
    logo: '',
    name: '',
    paymentTags: [],
  },
  thirdPart: IRampProviderType.AlchemyPay,
};
