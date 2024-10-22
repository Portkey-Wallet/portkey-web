import { IConfig } from '@portkey/types';
import {
  ISocialLoginConfig,
  NetworkType,
  ScreenLoadingInfo,
  TCustomNetworkType,
  TSupportAccountType,
} from '../../types';
import { BaseReCaptcha } from '../types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface ILoginConfig {
  loginMethodsOrder?: TSupportAccountType[];
  recommendIndexes?: number[];
}

export interface GlobalConfigProps extends IConfig {
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  socketUrl?: string;
  serviceUrl?: string;
  loginConfig?: ILoginConfig;
  customNetworkType?: TCustomNetworkType;
  networkType?: NetworkType;
  globalLoadingHandler?: {
    onSetLoading: (loadingInfo: ScreenLoadingInfo) => void;
  };
}
