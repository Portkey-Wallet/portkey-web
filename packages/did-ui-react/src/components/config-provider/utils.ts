import ConfigProvider from './';
import { dealURLLastChar, did } from '../../utils';
import { ISocialLoginConfig, TCustomNetworkType } from '../../types';

export const getServiceUrl = () => {
  if (!ConfigProvider.config.serviceUrl) throw Error('Please config serviceUrl');
  return dealURLLastChar(ConfigProvider.config.serviceUrl);
};

export const getSocketUrl = () => {
  return ConfigProvider.config.socketUrl || `${getServiceUrl()}/ca`;
};

// TODO: tg
export const getCommunicationSocketUrl = () => {
  return ConfigProvider.config.socketUrl || `${getServiceUrl()}/communication`;
};

export const getCustomNetworkType = (): TCustomNetworkType => {
  return ConfigProvider.config.customNetworkType
    ? (ConfigProvider.config.customNetworkType.toLowerCase() as TCustomNetworkType)
    : 'online';
};

export const getStorageInstance = () => {
  const storageMethod = ConfigProvider.config.storageMethod || did.config.storageMethod;
  if (!storageMethod) throw Error('Please config storageMethod');
  return storageMethod;
};

export const getTelegramBotId = () => {
  const socialLogin = ConfigProvider.getConfig('socialLogin') as ISocialLoginConfig;
  if (!socialLogin?.Telegram?.botId) throw Error('Please set Telegram botId in GlobalConfig');
  return socialLogin.Telegram.botId;
};
