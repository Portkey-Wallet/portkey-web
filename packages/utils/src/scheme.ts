import { stringifyUrl } from 'query-string';
export const DID_APP_SCHEMA = 'portkey.did';

export enum SCHEME_ACTION {
  login = 'login',
  linkDapp = 'linkDapp',
  addContact = 'addContact',
}

export interface IBaseHandleSchemeParams {
  scheme?: string;
  domain: string;
  action: string;
  custom: any;
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

export interface IScheme {
  formatScheme(params: ILoginHandleSchemeParams): string;
  formatScheme(params: ILinkDappHandleSchemeParams): string;
  formatScheme(params: IAddContactHandleSchemeParams): string;
}

export const formatScheme: IScheme['formatScheme'] = ({ scheme = DID_APP_SCHEMA, domain, action, custom }) => {
  return stringifyUrl(
    {
      url: `${scheme}://${domain}/${action}`,
      query: custom,
    },
    { encode: true },
  );
};
