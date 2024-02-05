import { stringifyUrl } from 'query-string';
export const DID_APP_SCHEMA = 'portkey.finance';
export const V1_DID_APP_SCHEMA = 'portkey.did';

export enum SCHEME_ACTION {
  login = 'login',
  linkDapp = 'linkDapp',
  addContact = 'addContact',
  addGroup = 'addGroup',
}

export interface IBaseHandleSchemeParams {
  scheme?: string;
  domain: string;
  action: string;
  custom: any;
  version?: 'v1';
}

export type LinkDappData = {
  url: string;
};

export type PortkeyID = string;

export interface ILinkDappHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'linkDapp';
  custom: LinkDappData;
}
export interface ILoginHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'login';
  custom: any;
}

export interface IAddContactHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'addContact';
  custom: PortkeyID;
}
export interface IAddGroupHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'addGroup';
  custom: PortkeyID;
}

export interface IScheme {
  formatScheme(params: ILoginHandleSchemeParams): string;
  formatScheme(params: ILinkDappHandleSchemeParams): string;
  formatScheme(params: IAddContactHandleSchemeParams): string;
  formatScheme(params: IAddGroupHandleSchemeParams): string;
}

export const formatScheme: IScheme['formatScheme'] = ({ scheme, domain, action, custom, version }) => {
  let _scheme = scheme || DID_APP_SCHEMA;
  if (version === 'v1' && !scheme) _scheme = V1_DID_APP_SCHEMA;
  return stringifyUrl(
    {
      url: `${_scheme}://${domain}/${action}`,
      query: custom,
    },
    { encode: true },
  );
};
