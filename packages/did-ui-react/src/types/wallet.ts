import { ChainType } from '@portkey/types';
import { CountryItem } from './country';
import { DeviceType, QRExtraDataType } from './device';

export interface QRData {
  type: 'login' | 'send';
  netWorkType: string;
  chainType: ChainType; // eth or nft
  address: string;
}

export interface LoginQRData extends QRData {
  type: 'login';
  extraData?: QRExtraDataType;
  deviceType?: DeviceType; // 0.0.1
}
export interface ISelectCountryCode {
  index: string;
  country: CountryItem;
}

export type RegisterType = 'Login' | 'Sign up';

export interface AuthenticationInfo {
  [userId: string]: string;
}

export type ISocialLogin = 'Google' | 'Apple';

export type TSocialResponseData = {
  accessToken: string;
  [x: string]: any;
};

export interface IGoogleLoginConfig {
  scope?: string;
  prompt?: string;
  uxMode?: string;
  clientId: string;
  loginHint?: string;
  accessType?: string;
  autoSelect?: boolean;
  redirectUri?: string;
  cookiePolicy?: string;
  hostedDomain?: string;
  discoveryDocs?: string;
  children?: React.ReactNode;
  isOnlyGetToken?: boolean;
  fetchBasicProfile?: boolean;
  // custom social login callback
  customLoginHandler?: TSocialLoginHandler;
}
interface BaseAppleLoginConfig {
  scope?: string;
  clientId: string;
  redirectURI?: string;
}
export interface IAppleLoginConfig extends BaseAppleLoginConfig {
  // custom social login callback
  customLoginHandler?: TSocialLoginHandler;
}

export interface ISocialLoginConfig {
  Google?: IGoogleLoginConfig;
  Apple?: IAppleLoginConfig;
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
