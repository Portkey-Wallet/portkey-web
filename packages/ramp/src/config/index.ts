import { HTTPHeaders } from '@portkey/types';
import { IRampConfig, IRampConfigOptions, IRequestDefaultsConfigOptions, TExtraRequestHeaders } from '../types';

export class RequestDefaultsConfig {
  public headers?: HTTPHeaders & TExtraRequestHeaders;
  public baseURL?: string;
  public socketUrl?: string;
  constructor(config?: IRequestDefaultsConfigOptions) {
    this.setConfig(config);
  }
  setConfig(config?: IRequestDefaultsConfigOptions) {
    if (config) {
      Object.entries(config).forEach(([key, value]) => {
        this[key as keyof IRequestDefaultsConfigOptions] = value;
      });
    }
  }
}

export class RampConfig implements IRampConfig {
  public requestConfig: RequestDefaultsConfig;

  constructor(options?: IRampConfigOptions) {
    this.requestConfig = new RequestDefaultsConfig();

    if (options) this.setConfig(options);
  }

  setConfig(options: IRampConfigOptions) {
    Object.entries(options).forEach(([_key, value]) => {
      if (!value) return;
      this.requestConfig.setConfig(value);
    });
  }
}
