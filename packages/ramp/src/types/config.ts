import { IRequestDefaults } from '@portkey/types';

export type TClientType = 'Android' | 'iOS' | 'Extension' | 'ThirdParty';

export type TExtraRequestHeaders = {
  Version: string;
  'Client-Type': TClientType;
  Authorization: string;
};

export interface IRequestDefaultsConfigOptions extends IRequestDefaults {
  socketUrl?: string;
}

export interface IRampConfigOptions {
  requestConfig: IRequestDefaults;
}

export interface IRampConfig {
  requestConfig: IRequestDefaults;
  setConfig(config: IRampConfigOptions): void;
}
