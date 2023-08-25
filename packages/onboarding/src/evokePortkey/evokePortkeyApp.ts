import { scheme as schemeUtils } from '@portkey/utils';
import { EvokeApp } from '../evokeApp';
import { PartialOption } from '@portkey/types';
import { APP_DOWNLOAD_URL } from '../constants';
import { EvokeAppOptions } from '../evokeApp/types';

export interface IBaseEvokeAppOption {
  timeout?: number;
  customFailureCallback?: () => void;
  onStatusChange?: EvokeAppOptions['logFunc'];
}

export type EvokePortkeyByLogin = PartialOption<Omit<schemeUtils.ILoginHandleSchemeParams, 'scheme'>, 'domain'> &
  IBaseEvokeAppOption;
type EvokePortkeyByLinkDapp = PartialOption<Omit<schemeUtils.ILinkDappHandleSchemeParams, 'scheme'>, 'domain'> &
  IBaseEvokeAppOption;

export interface IEvokePortkeyApp {
  evokePortkeyApp(params: EvokePortkeyByLogin): void;
  evokePortkeyApp(params: EvokePortkeyByLinkDapp): void;
}
export const evokePortkeyApp: IEvokePortkeyApp['evokePortkeyApp'] = ({
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
      domain: domain || window.location.host,
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
