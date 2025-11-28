import { AccountType } from '@portkey/services';
import { LoginMethod, TGAPageKey } from './types';
import { ConfigProvider } from '../../components';
import { GA_API_SECRET, MEASUREMENT_ID } from '../../constants/google-analytics';
import { getCustomNetworkType, getProviderNetworkType } from '../../components/config-provider/utils';
import { IStorageSuite } from '@portkey/types';
import { randomId } from '@portkey/utils';

export type TAllLoginKey = AccountType | 'Scan';

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const GA_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect';

// Get via https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports

const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;

// Duration of inactivity after which a new session is created
const SESSION_EXPIRATION_IN_MIN = 30;

class Analytics {
  debug: boolean;
  storageStore: Record<string, string>;
  constructor(debug = false) {
    this.debug = debug;
    this.storageStore = {};
  }

  // Returns the client id, or creates a new one if one doesn't exist.
  // Stores client id in local storage to keep the same client id as long as
  // the page is installed.
  async getOrCreateClientId() {
    let clientId = await this.storageMethod.getItem('analytics-clientId');

    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      clientId = randomId();

      await this.storageMethod.setItem('analytics-clientId', clientId);
    }
    return clientId;
  }

  // Returns the current session id, or creates a new one if one doesn't exist or
  // the previous one has expired.
  async getOrCreateSessionId() {
    // Use storage.session because it is only in memory
    let sessionData = await this.storageMethod.getItem('analytic-sessionData');
    const currentTimeInMs = Date.now();
    // Check if session exists and is still valid
    if (sessionData && sessionData.timestamp) {
      // Calculate how long ago the session was last updated
      const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
      // Check if last update lays past the session expiration threshold
      if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
        // Clear old session id to start a new session
        sessionData = null;
      } else {
        // Update timestamp to keep session alive
        sessionData.timestamp = currentTimeInMs;
        await this.storageMethod.setItem('analytic-sessionData', JSON.stringify(sessionData));
      }
    }
    if (!sessionData) {
      // Create and store a new session
      sessionData = {
        session_id: currentTimeInMs.toString(),
        timestamp: currentTimeInMs.toString(),
      };
      await this.storageMethod.setItem('analytic-sessionData', JSON.stringify(sessionData));
    }
    return sessionData.session_id;
  }

  // Fires an event with optional params. Event names must only include letters and underscores.
  async fireEvent(name: string, params: any = {}) {
    const cwt = getCustomNetworkType();
    if (cwt !== 'online') return;
    // Configure session id and engagement time if not present, for more details see:
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
    }
    params.networkType = getProviderNetworkType();

    if (!GA_API_SECRET) return;
    try {
      const response = await fetch(
        `${this.debug ? GA_DEBUG_ENDPOINT : GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name,
                params,
              },
            ],
          }),
        },
      );
      if (!this.debug) {
        return;
      }
      console.log(await response.text(), 'fireEvent=', name);
    } catch (e) {
      console.error('Google Analytics request failed with an exception', e);
    }
  }

  get _storage(): IStorageSuite {
    const storageStore = typeof localStorage !== 'undefined' ? localStorage : this.storageStore;
    return {
      setItem: async (key: string, value: string) => {
        storageStore[key] = value;
      },
      getItem: async (key: string) => {
        return storageStore[key];
      },
      removeItem: async (key: string) => {
        delete storageStore[key];
      },
    };
  }

  get storageMethod() {
    const storage = ConfigProvider.config.storageMethod ?? this._storage;
    return storage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loginStartEvent(loginType: TAllLoginKey, _additionalParams = {}) {
    try {
      const params = { timestamp: Date.now(), loginType };

      await this.storageMethod?.setItem('analytic-loginStart', JSON.stringify(params));

      // return this.fireEvent('portkey_sdk_login_start', {
      //   ...params,
      //   ...additionalParams,
      // });
    } catch (error) {
      console.error('Google Analytics request failed with an exception', error);
    }
  }

  async loginEndEvent(loginMethod: LoginMethod, additionalParams = {}) {
    try {
      const loginStart = await this.storageMethod?.getItem('analytic-loginStart');
      // if (!loginStart) return;
      const { loginType = 'Email', timestamp = Date.now() } = JSON.parse(loginStart ?? '{}');

      const params = { timestamp: Date.now(), loginType, loginMethod, duration: 0 };
      params.duration = params.timestamp - timestamp;
      console.log('portkey_sdk_register', loginMethod, 'portkey_sdk_register==');
      if ('register' === loginMethod) {
        await this.fireEvent('portkey_sdk_register', {
          ...params,
          hostname: location.hostname,
          registerSiteUrl: location.hostname, // portkey.finance
          ...additionalParams,
        });
      } else {
        await this.fireEvent('portkey_sdk_login_end', {
          ...params,
          hostname: location.hostname,
          loginSiteUrl: location.hostname, // portkey.finance
          ...additionalParams,
        });
      }
      this.storageMethod?.removeItem('analytic-loginStart');
    } catch (e) {
      console.error('Google Analytics request failed with an exception', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async pageStateUpdateStartEvent(pageKey: TGAPageKey, _additionalParams = {}) {
    try {
      const params = { timestamp: Date.now(), pageKey };

      await this.storageMethod.setItem(`${pageKey}_pageStateUpdate`, JSON.stringify({ timestamp: params.timestamp }));

      // return this.fireEvent('extension_page_update_start', {
      //   ...params,
      //   ...additionalParams,
      // });
    } catch (e) {
      console.error('Google Analytics request failed with an exception', e);
    }
  }

  async pageStateUpdateEndEvent(pageKey: TGAPageKey, additionalParams = {}) {
    try {
      const sessionKey = `${pageKey}_pageStateUpdate`;
      const sessionParams = await this.storageMethod.getItem(sessionKey);
      const { timestamp } = JSON.parse(sessionParams ?? '{}');

      const params = { timestamp: Date.now(), pageKey, duration: 0 };

      params.duration = params.timestamp - timestamp;

      // return this.fireEvent('portkey_sdk_page_update_end', {
      //   ...params,
      //   ...additionalParams,
      // });
    } catch (e) {
      console.error('Google Analytics request failed with an exception', e);
    }
  }
}

const googleAnalytics = new Analytics();
export default googleAnalytics;
