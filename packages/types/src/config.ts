import type { IRequestDefaults } from './request';
import type { IStorageSuite } from './storage';
export interface IConfig {
  requestDefaults?: IRequestDefaults;
  graphQLUrl?: string;
  storageMethod?: IStorageSuite;
  /** Get the service url of user jwt token  */
  connectUrl?: string;
}
