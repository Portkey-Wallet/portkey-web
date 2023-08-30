import { stringify } from 'query-string';
import { WEB_PAGE } from '../constants';
import { scheme } from '@portkey/utils';

type IBaseOption = {
  timeout?: number;
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
  new Promise((resolve, reject) => {
    let timer: any = null;

    const onMessage = (event: MessageEvent) => {
      const type = event.data.type;
      if (type === 'PortkeyDownloadOnSuccess' || type === 'PortkeyDownloadOnFailure') {
        timer && clearInterval(timer);
      }
      switch (type) {
        case 'PortkeyDownloadOnSuccess':
          resolve(event.data.data);
          break;
        case 'PortkeyDownloadOnFailure':
          reject(event.data.error);
          break;
        default:
          return;
      }
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);

    const windowOpener = window.open(`${WEB_PAGE}/portkey-download?${stringify(params)}`);

    timer = setInterval(() => {
      if (windowOpener?.closed) {
        clearInterval(timer);
        reject('User close the prompt');
        timer = null;
      }
    }, 1600);
  });

export default evokeByThirdParty;
