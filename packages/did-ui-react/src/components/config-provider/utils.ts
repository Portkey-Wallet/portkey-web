import ConfigProvider from './';
import { dealURLLastChar, did } from '../../utils';

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

export const getCustomNetworkType = () => {
  return ConfigProvider.config.customNetworkType || 'onLine';
};

export const getStorageInstance = () => {
  const storageMethod = ConfigProvider.config.storageMethod || did.config.storageMethod;
  if (!storageMethod) throw Error('Please config storageMethod');
  return storageMethod;
};
