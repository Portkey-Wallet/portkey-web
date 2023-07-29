import { IConfig } from '@portkey/types';
import { IRampConfig, ISocialLoginConfig } from '../../types';
import { BaseReCaptcha } from '../types';
import { IChain } from '@portkey/provider-types';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export interface GlobalConfigProps extends IConfig {
  socialLogin?: ISocialLoginConfig;
  reCaptchaConfig?: BaseReCaptcha;
  socketUrl?: string;
  apiUrl?: string;
  ramp?: IRampConfig;
  currentChain?: IChain & { symbol: string };
  walletInfo?: { walletType: string; caAddress: string; balance: string; decimals: number };
}
