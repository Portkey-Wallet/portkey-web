import { IStorageSuite } from '@portkey/types';
import { ISocialLogin, TCustomNetworkType } from '../../types';
import { OPENLOGIN_ACTIONS, UX_MODE } from './constants';
import { CrossTabPushMessageType } from '@portkey/socket';

export type UX_MODE_TYPE = (typeof UX_MODE)[keyof typeof UX_MODE];

export type OPENLOGIN_ACTIONS_TYPE = (typeof OPENLOGIN_ACTIONS)[keyof typeof OPENLOGIN_ACTIONS];

export type OpenLoginOptions = {
  clientId?: string;
  /**
   * specifies the network to be used.
   */
  network: TCustomNetworkType;

  /**
   * socketURI
   */

  serviceURI?: string;

  /**
   * socketURI
   */

  socketURI?: string;

  /**
   * two uxModes are supported:-
   * - `'POPUP'`: In this uxMode, a popup will be shown to user for login.
   * - `'REDIRECT'`: In this uxMode, user will be redirected to a new window tab for login.
   *
   * @defaultValue `'POPUP'`
   * @remarks
   *
   * Use of `'REDIRECT'` mode is recommended in browsers where popups might get blocked.
   */
  uxMode?: UX_MODE_TYPE;

  /**
   * replaceUrlOnRedirect removes the params from the redirected url after login
   *
   * @defaultValue true
   */
  replaceUrlOnRedirect?: boolean;

  /**
   * sdkUrl is for internal development use only and is used to override the
   * `network` parameter.
   * @internal
   */
  sdkUrl?: string;

  /**
   * setting to "local" will persist social login session across browser tabs.
   *
   * @defaultValue "local"
   */
  storageKey?: 'session' | 'local';

  /**
   * storage
   */

  currentStorage?: IStorageSuite;
};

export type LoginParams = {
  /**
   * loginProvider sets the oauth login method to be used.
   * You can use any of the valid loginProvider from the supported list.
   */
  loginProvider: ISocialLogin;
} & Record<string, any>;

export interface OpenloginParamConfig extends LoginParams {
  actionType: OPENLOGIN_ACTIONS_TYPE;
  publicKey?: string;
  serviceURI: string;
}

export type TOpenLoginSessionInfo = {
  loginId: string;
  publicKey: string;
  needPersist: boolean;
};

export type TPushMessageByApiParams = {
  loginId: string;
  data: string;
  needPersist: boolean;
};

export type TPushMessageByApi = {
  methodName: CrossTabPushMessageType;
  params: TPushMessageByApiParams;
  times?: number;
};
