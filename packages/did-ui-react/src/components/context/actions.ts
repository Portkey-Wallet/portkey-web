import { ChainType } from '@portkey-v1/types';
import { Theme } from '../types';
import { basicActions } from './utils';
import { NetworkType } from '../../types';

const PortkeyActions = {
  setTheme: 'SET_THEME',
  destroy: 'DESTROY',
};

export type PortkeyState = {
  theme?: Theme;
  sandboxId?: string;
  networkType: NetworkType;
  chainType: ChainType;
};

export const basicPortkeyView = {
  setTheme: {
    type: PortkeyActions['setTheme'],
    actions: (theme: Theme) =>
      basicActions(PortkeyActions['setTheme'], {
        theme,
      }),
  },
  destroy: {
    type: PortkeyActions['destroy'],
    actions: () => basicActions(PortkeyActions['destroy']),
  },
};
