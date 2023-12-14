import { scheme as schemeUtils } from '@portkey/utils';
import { EvokeApp } from '../evokeApp';
import { APP_DOWNLOAD_URL } from '../constants';
import { IEvokePortkeyApp } from './types';

const evokePortkeyApp: IEvokePortkeyApp['evokePortkeyApp'] = ({
  domain,
  custom,
  action,
  timeout = 4000,
  customFailureCallback,
  onStatusChange,
}) => {
  const callLib = new EvokeApp({
    scheme: {
      protocol: schemeUtils.DID_APP_SCHEMA, // 'portkey.did',
      domain: domain || window?.location.host,
    },
    timeout,
    appStore: APP_DOWNLOAD_URL.APP_STORE,
    fallback: APP_DOWNLOAD_URL.CHROME_STORE,
    logFunc: onStatusChange,
    buildScheme: (config, options) => {
      return schemeUtils.formatScheme({
        scheme: schemeUtils.DID_APP_SCHEMA,
        action: action,
        domain: options.scheme.domain,
        custom: config.param,
      });
    },
  });

  callLib.open({
    path: action,
    param: custom,
    callback: customFailureCallback,
  });
};

export default evokePortkeyApp;
