import { GlobalConfigProps } from './types';
import { setVerification, did, setNetwork, setNetworkInfo, setServiceConfig } from '../../utils';

const defaultConfig: GlobalConfigProps = {
  network: {
    networkList: [],
    defaultNetwork: undefined,
  },
  // fontFamily400: '../../assets/fonts/Roboto-Regular.ttf',
  // fontFamily500: '../../assets/fonts/Roboto-Medium.ttf',
  // fontFamily600: '../../assets/fonts/Roboto-Bold.ttf',
  // storage?: Storage; //
  // prefixCls: string;
};

type ConfigKey = keyof GlobalConfigProps;

class LocalConfigProvider {
  config: GlobalConfigProps;

  constructor(config: GlobalConfigProps) {
    this.config = config;
  }

  getGlobalConfig = () => {
    return this.config;
  };

  getConfig = (key: ConfigKey) => {
    return this.config?.[key];
  };

  setGlobalConfig = (_config: Partial<GlobalConfigProps>) => {
    if ('network' in _config) {
      _config.network?.networkList && setNetworkInfo(_config.network);
      // throw "The current version does not support switching networks, please use 'setGlobalConfig.requestDefaults' or 'setGlobalConfig.graphQLUrl' to configure the network";
    }
    if ('requestDefaults' in _config) {
      did.setConfig({ requestDefaults: _config['requestDefaults'] });
      setServiceConfig(_config['requestDefaults']);
      _config.requestDefaults && setServiceConfig(_config.requestDefaults);
    }
    if ('storageMethod' in _config && _config.storageMethod) {
      setVerification(_config.storageMethod);
      did.setConfig({
        storageMethod: _config['storageMethod'],
      });
    }
    if ('graphQLUrl' in _config) {
      did.setConfig({
        graphQLUrl: _config['graphQLUrl'],
      });
    }
    this.config = { ...this.config, ..._config };
  };

  setNetwork = (network: string) => {
    this.config.network.defaultNetwork = network;
    setNetwork(network);
  };

  getSocialLoginConfig = () => {
    return this.config.socialLogin;
  };
}

export const localConfigProvider = new LocalConfigProvider(defaultConfig);
