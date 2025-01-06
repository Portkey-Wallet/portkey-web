import { IPortkeyProvider } from '@portkey/provider-types';
import { NetworkType, ThemeType } from '../../types';

import { ConnectionStatus } from '../types';
import { basicActions } from '../utils';

export const WebWalletActions = {
  setWalletProvider: 'SET_WALLET_PROVIDER',

  destroy: 'DESTROY',
};

export interface IConnectState {
  options: {
    theme?: ThemeType;
    networkType: NetworkType;
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
