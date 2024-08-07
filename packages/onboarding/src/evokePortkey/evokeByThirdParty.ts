import queryString from 'query-string';
import { WEB_PAGE } from '../constants';
import { scheme } from '@portkey/utils';

type IBaseOption = {
  timeout?: number;
  isEvokeApp?: boolean;
};

interface IEvokeByThirdParty {
  evokeByThirdParty(
    params?: {
      action: 'login';
      custom: scheme.ILoginHandleSchemeParams['custom'];
    } & IBaseOption,
  ): Promise<any>;
  evokeByThirdParty(
    params?: {
      action: 'linkDapp';
      custom: scheme.ILinkDappHandleSchemeParams['custom'];
    } & IBaseOption,
  ): Promise<any>;
}

const evokeByThirdParty: IEvokeByThirdParty['evokeByThirdParty'] = params =>
  Promise.resolve(window.open(`${WEB_PAGE}/portkey-download?${queryString.stringify(params)}`));

export default evokeByThirdParty;
