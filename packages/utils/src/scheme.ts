import { stringifyUrl } from 'query-string';
export const DID_APP_SCHEMA = 'portkey.did';

export interface IBaseHandleSchemeParams {
  scheme?: string;
  domain?: string;
  action: string;
  custom: any;
}

export type LinkDappData = {
  url: string;
};

export interface ILinkDappHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'linkDapp';
  custom: LinkDappData;
}
export interface ILoginHandleSchemeParams extends IBaseHandleSchemeParams {
  action: 'login';
  custom: any;
}

export interface IScheme {
  handleScheme(params: IBaseHandleSchemeParams): string;
  handleScheme(params: ILoginHandleSchemeParams): string;
  handleScheme(params: ILinkDappHandleSchemeParams): string;
}

export const handleScheme: IScheme['handleScheme'] = ({
  scheme = DID_APP_SCHEMA,
  domain = window?.location.href,
  action,
  custom,
}) => {
  return stringifyUrl(
    {
      url: `${scheme}://${domain}/${action}`,
      query: custom,
    },
    { encode: true },
  );
};
