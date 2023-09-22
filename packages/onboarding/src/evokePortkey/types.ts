import { PartialOption } from '@portkey/types';
import { EvokeAppOptions } from '../evokeApp/types';
import { scheme as schemeUtils } from '@portkey/utils';

export interface IBaseEvokeAppOption {
  timeout?: number;
  customFailureCallback?: () => void;
  onStatusChange?: EvokeAppOptions['logFunc'];
}

export type EvokePortkeyByLogin = PartialOption<Omit<schemeUtils.ILoginHandleSchemeParams, 'scheme'>, 'domain'> &
  IBaseEvokeAppOption;
export type EvokePortkeyByLinkDapp = PartialOption<Omit<schemeUtils.ILinkDappHandleSchemeParams, 'scheme'>, 'domain'> &
  IBaseEvokeAppOption;

export type EvokePortkeyByAddContact = PartialOption<
  Omit<schemeUtils.IAddContactHandleSchemeParams, 'scheme'>,
  'domain'
> &
  IBaseEvokeAppOption;

export type EvokePortkeyByAddGroup = PartialOption<Omit<schemeUtils.IAddGroupHandleSchemeParams, 'scheme'>, 'domain'> &
  IBaseEvokeAppOption;

export interface IEvokePortkeyApp {
  evokePortkeyApp(params: EvokePortkeyByLogin): void;
  evokePortkeyApp(params: EvokePortkeyByLinkDapp): void;
  evokePortkeyApp(params: EvokePortkeyByAddContact): void;
  evokePortkeyApp(params: EvokePortkeyByAddGroup): void;
}

export interface IEvokeExtensionProps {
  openTarget?: '_self' | '_blank';
}
