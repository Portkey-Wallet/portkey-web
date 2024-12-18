import { GlobalConfigProps } from './types';
import { setVerification, did, setServiceConfig, setReCaptchaConfig, BaseAsyncStorage } from '../../utils';
import { ThemeType } from '../../types';
import { DEFAULT_THEME, initTheme } from '../../assets/theme';

export const apiVersion = 'v1.18.0';

did.setConfig({
  requestDefaults: {
    headers: { version: apiVersion },
  },
});

const defaultConfig: GlobalConfigProps = {};

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
    if (('storageMethod' in _config && _config.storageMethod) || !this.config.storageMethod) {
      const storageMethod = _config.storageMethod || new BaseAsyncStorage();
      setVerification(storageMethod);
      did.setConfig({
        storageMethod,
      });
    }

    if ('requestDefaults' in _config) {
      const requestDefaults = _config['requestDefaults'];
      if (requestDefaults) {
        if (!requestDefaults.headers) requestDefaults.headers = {};
        if (!requestDefaults.headers.version) requestDefaults.headers.version = apiVersion;
        did.setConfig({ requestDefaults: requestDefaults });
        setServiceConfig(_config['requestDefaults']);
        _config.requestDefaults && setServiceConfig(_config.requestDefaults);
      }
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
    if ('referralInfo' in _config) {
      did.setConfig({
        referralInfo: _config['referralInfo'],
      });
    }
    if ('theme' in _config) {
      const theme: ThemeType = _config['theme'] || DEFAULT_THEME;
      initTheme(theme);
    }
    this.config = { ...this.config, ..._config };
  };

  getSocialLoginConfig = () => {
    return this.config.socialLogin;
  };
}

export const localConfigProvider = new LocalConfigProvider(defaultConfig);
