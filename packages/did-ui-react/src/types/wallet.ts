import { ChainType } from '@portkey/types';
import { ICountryItem } from './country';
import { DeviceType, QRExtraDataType } from './device';
import { AccountType } from '@portkey/services';

export type NetworkType = 'MAINNET' | 'TESTNET';

export interface QRData {
  type: 'login' | 'send';
  networkType: string;
  chainType: ChainType; // eth or nft
  address: string;
  id: string; // uuid
}

export interface LoginQRData extends QRData {
  type: 'login';
  extraData?: QRExtraDataType;
  deviceType?: DeviceType; // 0.0.1
}
export interface ISelectCountryCode {
  index: string;
  country: ICountryItem;
}

export type RegisterType = 'Login' | 'Sign up';

export interface AuthenticationInfo {
  [userId: string]: string;
}

export type ISocialLogin = 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';

export type IWeb2Login = 'Email' | 'Phone';

export type TSocialResponseData = {
  accessToken?: string;
  token?: string;
  [x: string]: any;
};

export interface IGoogleLoginConfig {
  clientId?: string;
  redirectURI?: string;
  // custom social login callback
  customLoginHandler?: TSocialLoginHandler;
}
interface BaseAppleLoginConfig {
  clientId?: string;
  redirectURI?: string;
}
interface ICustomLoginConfigHandler extends BaseAppleLoginConfig {
  // custom social login callback
  customLoginHandler?: TSocialLoginHandler;
}

export interface ITelegramLoginConfig {
  customLoginHandler?: TSocialLoginHandler;
}

interface IPortkeyLoginConfig {
  websiteName: string;
  websiteIcon?: string;
}

export interface ISocialLoginConfig {
  Google?: IGoogleLoginConfig;
  Apple?: ICustomLoginConfigHandler;
  Telegram?: ITelegramLoginConfig;
  Portkey?: IPortkeyLoginConfig;
  Twitter?: ICustomLoginConfigHandler;
  Facebook?: ICustomLoginConfigHandler;
}

export interface AppleAuthorized {
  idToken: string; // accessToken is apple idToken
}
export interface GoogleAuthorized {
  accessToken: string;
}

interface SocialResponseInfo {
  data?: TSocialResponseData;
  error?: Error;
}

export type TSocialLoginHandler = () => Promise<SocialResponseInfo>;

export type SocialLoginFinishHandler = (value: { type: ISocialLogin; data?: TSocialResponseData }) => void;

export type TSupportAccountType = Exclude<AccountType, 'Phone'> | 'Scan';

export type TotalAccountType = AccountType | 'Scan';
