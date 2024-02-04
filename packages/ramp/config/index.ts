import { HTTPHeaders, HTTPMethod, IRequestDefaults } from '@portkey/types';
import { IRampConfig, IRampConfigOptions } from '../types';

export class RequestDefaultsConfig {
  public headers?: HTTPHeaders;
  public baseURL?: string;
  public url?: string;
  public method?: HTTPMethod;
  public timeout?: number;
  public connectUrl?: string;
  constructor(config?: IRequestDefaults) {
    this.setConfig(config);
  }
  setConfig(config?: IRequestDefaults) {
    if (config) {
      Object.entries(config).forEach(([key, value]) => {
        this[key as keyof IRequestDefaults] = value;
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
    Object.entries(options).forEach(([key, value]) => {
      if (!value) return;
      this.requestConfig.setConfig(value);
    });
  }
}
