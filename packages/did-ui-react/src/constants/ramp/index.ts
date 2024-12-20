import { ChainId } from '@portkey/types';
import { WEB_PAGE } from '..';
import { ELF_SYMBOL } from '../assets';
import { MAIN_CHAIN_ID } from '../network';
import { IRampCryptoDefault, IRampFiatDefault, IRampProviderType, RampType } from '@portkey/ramp';
import { IGetBuyDetail, IGetSellDetail } from '../../components/Ramp/utils/api';

export const TOKEN_CLAIM_CONTRACT_CHAIN_ID = 'AELF' as ChainId;

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

export const DEFAULT_SYMBOL = 'ELF';
export const MAX_UPDATE_TIME = 15;
export const initFiatAmount = '200';
export const initCryptoAmount = '400';

export const RAMP_WEB_PAGE_ROUTE = WEB_PAGE + '/third-part-bridge/';

export const RAMP_WITH_DRAW_URL = RAMP_WEB_PAGE_ROUTE + '?portkeyMethod=ACH_SELL_BACK&version=v2&v=2.7.0';

export const OUR_PRODUCT_NAME = 'Portkey';

export const BUY_SOON_TEXT = 'On-ramp is currently not supported. It will be launched in the coming weeks.';

export const SELL_SOON_TEXT = 'Off-ramp is currently not supported. It will be launched in the coming weeks.';

export const SERVICE_UNAVAILABLE_TEXT = 'Sorry, the service you are using is temporarily unavailable.';

export const DISCLAIMER_TEXT =
  ' as an independent fiat-to crypto platform under a third-party entity. Portkey Wallet assumes no liability for any losses or damages arising from the use of ';

export const INSUFFICIENT_FUNDS_TEXT = 'Insufficient funds';

export const SYNCHRONIZING_CHAIN_TEXT = 'Synchronizing on-chain account information...';

export const SHOW_RAMP_SYMBOL_LIST = [DEFAULT_SYMBOL, 'USDT'];

export const SHOW_RAMP_CHAIN_ID_LIST = [MAIN_CHAIN_ID];

export const initCrypto: IRampCryptoDefault = {
  symbol: DEFAULT_SYMBOL,
  chainId: MAIN_CHAIN_ID,
  network: '',
  icon: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
  amount: initCryptoAmount,
  decimals: 8,
  address: '',
};

export const initFiat: IRampFiatDefault = {
  country: 'US',
  symbol: 'USD',
  countryName: 'United States',
  icon: 'https://static.alchemypay.org/alchemypay/flag/US.png',
  amount: initFiatAmount,
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
