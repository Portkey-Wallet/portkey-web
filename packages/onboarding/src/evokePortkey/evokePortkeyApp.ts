import { scheme as schemeUtils } from '@portkey/utils';
import { EvokeApp } from '../evokeApp';
import { APP_DOWNLOAD_URL, PORTKEY_V2_DOWNLOAD_URL } from '../constants';
import { IEvokePortkeyApp } from './types';

const evokePortkeyApp: IEvokePortkeyApp['evokePortkeyApp'] = ({
  domain,
  custom,
  action,
  timeout = 4000,
  customFailureCallback,
  onStatusChange,
  version,
}) => {
  const downloadUrl = version !== 'v1' ? PORTKEY_V2_DOWNLOAD_URL : APP_DOWNLOAD_URL;
  const scheme = version !== 'v1' ? schemeUtils.DID_APP_SCHEMA : schemeUtils.V1_DID_APP_SCHEMA;
  const callLib = new EvokeApp({
    scheme: {
      protocol: scheme,
      domain: domain || window?.location.host,
    },
    timeout,
    appStore: downloadUrl.APP_STORE,
    fallback: downloadUrl.CHROME_STORE,
    logFunc: onStatusChange,
    buildScheme: (config, options) => {
      return schemeUtils.formatScheme({
        scheme,
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
