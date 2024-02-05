import { IConfig } from '@portkey/types';
import { ISocialLoginConfig, TotalAccountType } from '../../types';
import { BaseReCaptcha } from '../types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface ILoginConfig {
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
}

export type TCustomNetworkType = 'Offline' | 'onLine';

export interface GlobalConfigProps extends IConfig {
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  socketUrl?: string;
  apiUrl?: string;
  serviceUrl?: string;
  loginConfig?: ILoginConfig;
  customNetworkType?: TCustomNetworkType;
}
