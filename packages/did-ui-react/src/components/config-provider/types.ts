import { IConfig } from '@portkey/types';
import { ISocialLoginConfig, NetworkInfo } from '../../types';
import { BaseReCaptcha, Theme } from '../types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface GlobalConfigProps extends IConfig {
  network: NetworkInfo;
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  socketUrl?: string;
  // Currently theme is used to control content such as pictures under the black/light theme
  theme?: Theme;

  // TODO There feature
  // autoClose?: boolean;
  // prefixCls?: string;
  // fontFamily400?: string;
  // fontFamily500?: string;
  // fontFamily600?: string;
}
