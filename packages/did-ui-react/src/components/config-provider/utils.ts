import ConfigProvider from './';
import { dealURLLastChar } from '../../utils';

export const getServiceUrl = () => {
  if (!ConfigProvider.config.serviceUrl) throw Error('Please config serviceUrl');
  return dealURLLastChar(ConfigProvider.config.serviceUrl);
};

export const getSocketUrl = () => {
  return ConfigProvider.config.socketUrl || `${getServiceUrl()}/ca`;
};

export const getCustomNetworkType = () => {
  return ConfigProvider.config.customNetworkType || 'onLine';
};
