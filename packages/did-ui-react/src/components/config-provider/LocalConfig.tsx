import { GlobalConfigProps } from './types';
import { setVerification, did, setNetwork, setNetworkInfo, setServiceConfig, setReCaptchaConfig } from '../../utils';

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
      const requestDefaults = _config['requestDefaults'];
      if (requestDefaults) {
        if (!requestDefaults.headers) requestDefaults.headers = {};
        requestDefaults.headers.version = 'v1.3.0';
        did.setConfig({ requestDefaults: requestDefaults });
        setServiceConfig(_config['requestDefaults']);
        _config.requestDefaults && setServiceConfig(_config.requestDefaults);
      }
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
    if ('connectUrl' in _config) {
      did.setConfig({
        connectUrl: _config['connectUrl'],
      });
    }
    if ('reCaptchaConfig' in _config) {
      _config['reCaptchaConfig'] && setReCaptchaConfig(_config['reCaptchaConfig']);
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
