import { IConfig } from '@portkey/types';
import { ISocialLoginConfig, TotalAccountType } from '../../types';
import { BaseReCaptcha } from '../types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface GlobalConfigProps extends IConfig {
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  socketUrl?: string;
  apiUrl?: string;
  serviceUrl?: string;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
}
