import { ChainType } from '@portkey/types';
import { ICountryItem } from './country';
import { DeviceType, QRExtraDataType } from './device';

export interface QRData {
  type: 'login' | 'send';
  netWorkType: string;
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

export type ISocialLogin = 'Google' | 'Apple';

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
export interface IAppleLoginConfig extends BaseAppleLoginConfig {
  // custom social login callback
  customLoginHandler?: TSocialLoginHandler;
}

interface IPortkeyLoginConfig {
  websiteName: string;
  websiteIcon?: string;
}

export interface ISocialLoginConfig {
  Google?: IGoogleLoginConfig;
  Apple?: IAppleLoginConfig;
  Portkey?: IPortkeyLoginConfig;
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
