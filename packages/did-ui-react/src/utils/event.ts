import { eventBus } from './index';
import { NetworkInfo } from '../types';
import { SET_NETWORK, SET_NETWORK_INFO, SET_RECAPTCHA_CONFIG, SET_SERVICE_CONFIG } from '../constants/events';
import { IConfig } from '@portkey/types';
import { BaseReCaptcha } from '../components/types/reCaptcha';

export const setNetwork = (network: string) => eventBus.emit(SET_NETWORK, network);
export const setNetworkInfo = (networkInfo: NetworkInfo) => eventBus.emit(SET_NETWORK_INFO, networkInfo);
export const setServiceConfig = (option: IConfig['requestDefaults']) => eventBus.emit(SET_SERVICE_CONFIG, option);
export const setReCaptchaConfig = (option: BaseReCaptcha) => eventBus.emit(SET_RECAPTCHA_CONFIG, option);
