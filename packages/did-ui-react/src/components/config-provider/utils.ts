import ConfigProvider from './';
import { dealURLLastChar } from '../../utils';

export const getServiceUrl = () => {
  if (!ConfigProvider.config.serviceUrl) throw Error('Please config serviceUrl');
  return ConfigProvider.config.serviceUrl;
};

export const getSocketUrl = () => {
  return ConfigProvider.config.socketUrl || `${dealURLLastChar(getServiceUrl())}/ca`;
};
