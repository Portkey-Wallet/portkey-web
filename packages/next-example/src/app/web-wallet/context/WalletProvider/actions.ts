import { NetworkType, ThemeType } from '@portkey/did-ui-react';
import { IPageState } from '../types';
import { basicActions } from '../utils';

export const WebWalletActions = {
  setWalletPageState: 'SET_WALLET_PAGE_STATE',
  setWalletPin: 'SET_WALLET_PIN',
  setWalletOptions: 'SET_WALLET_OPTIONS',
  destroy: 'DESTROY',
};

export interface IWebWalletState {
  pageState: IPageState | null;
  pin?: string;
  options?: IWalletOptions;
}

export interface IWalletOptions {
  theme?: ThemeType;
  networkType: NetworkType;
  appId: string;
  isTelegram?: boolean;
}

export const basicWebWalletView = {
  setWalletPageState: {
    type: WebWalletActions['setWalletPageState'],
    actions: (pageState: IPageState | null) => {
      return basicActions(WebWalletActions['setWalletPageState'], {
        pageState,
      });
    },
  },
  setWalletPin: {
    type: WebWalletActions['setWalletPin'],
    actions: (pin: string) => {
      return basicActions(WebWalletActions['setWalletPin'], {
        pin,
      });
    },
  },
  setWalletOptions: {
    type: WebWalletActions['setWalletOptions'],
    actions: (options: IWalletOptions) => {
      return basicActions(WebWalletActions['setWalletOptions'], {
        options,
      });
    },
  },
  destroy: {
    type: WebWalletActions['destroy'],
    actions: () => basicActions(WebWalletActions['destroy']),
  },
};
