import { IRequestDefaults } from '@portkey/types';

export type IClientType = 'Android' | 'iOS' | 'Extension';

export interface IRampConfigOptions {
  requestConfig: IRequestDefaults;
}

export interface IRampConfig {
  requestConfig: IRequestDefaults;
  setConfig(config: IRampConfigOptions): void;
}
