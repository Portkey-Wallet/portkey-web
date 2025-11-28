import { IPortkeyProvider } from '@portkey/provider-types';
import { NetworkType, ThemeType } from '../../types';
import { basicActions } from '../utils';
import { ILoginConfig, TDesign } from '../../types/signIn';

export const WebWalletActions = {
  setWalletProvider: 'SET_WALLET_PROVIDER',
  destroy: 'DESTROY',
};

export interface IConnectState {
  options: {
    networkType: NetworkType;
    appId: string;
    theme?: ThemeType;
    loginConfig?: ILoginConfig;
    design?: TDesign;
  };

  provider: IPortkeyProvider | null;
}

export const basicWebWalletView = {
  setWalletProvider: {
    type: WebWalletActions['setWalletProvider'],
    actions: (provider: IPortkeyProvider) => {
      return basicActions(WebWalletActions['setWalletProvider'], {
        provider,
        connectionStatus: 'connecting',
      });
    },
  },
  destroy: {
    type: WebWalletActions['destroy'],
    actions: () => basicActions(WebWalletActions['destroy']),
  },
};
