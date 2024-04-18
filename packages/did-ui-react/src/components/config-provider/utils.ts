import ConfigProvider from './';
import { dealURLLastChar, did } from '../../utils';
import { ISocialLoginConfig, NetworkType, TCustomNetworkType } from '../../types';
import { Portkey_Bot_Webapp } from '../../constants/telegram';

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

export const getDappTelegramLink = () => {
  const socialLogin = ConfigProvider.getConfig('socialLogin') as ISocialLoginConfig;
  if (!socialLogin?.Telegram?.dappTelegramLink) throw Error('Please set dappTelegramLink in GlobalConfig');
  return socialLogin.Telegram.dappTelegramLink;
};

export const getPortkeyBotWebappLink = (ctw: TCustomNetworkType, network?: NetworkType) => {
  return network ? Portkey_Bot_Webapp[ctw][network] : Portkey_Bot_Webapp[ctw].MAINNET;
};
