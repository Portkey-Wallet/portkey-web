import { eventBus } from './index';
import { SET_RECAPTCHA_CONFIG, SET_SERVICE_CONFIG } from '../constants/events';
import { IConfig } from '@portkey-v1/types';
import { BaseReCaptcha } from '../components/types/reCaptcha';

export const setServiceConfig = (option: IConfig['requestDefaults']) => eventBus.emit(SET_SERVICE_CONFIG, option);
export const setReCaptchaConfig = (option: BaseReCaptcha) => eventBus.emit(SET_RECAPTCHA_CONFIG, option);
