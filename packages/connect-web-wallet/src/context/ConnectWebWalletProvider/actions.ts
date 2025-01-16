import { IPortkeyProvider } from '@portkey/provider-types';
import { NetworkType, ThemeType } from '../../types';
import { basicActions } from '../utils';

export const WebWalletActions = {
  setWalletProvider: 'SET_WALLET_PROVIDER',
  destroy: 'DESTROY',
};

export interface ILoginConfig {
  loginMethodsOrder?: ('Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter')[];
  recommendIndexes?: number[];
}

export interface IConnectState {
  options: {
    networkType: NetworkType;
    appId: string;
    theme?: ThemeType;
    loginConfig?: ILoginConfig;
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
