import { IConfig } from '@portkey/types';
import { ISocialLoginConfig, NetworkInfo } from '../../types';
import { BaseReCaptcha } from '../types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface GlobalConfigProps extends IConfig {
  network: NetworkInfo;
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  // storage?: IStorageSuite; //

  // locale?: Locale;
  // TODO There feature
  // autoClose?: boolean;
  // prefixCls?: string;
  // fontFamily400?: string;
  // fontFamily500?: string;
  // fontFamily600?: string;
}
