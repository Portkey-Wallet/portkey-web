import { Theme } from '../types';
import { basicActions } from './utils';

const PortkeyActions = {
  setTheme: 'SET_THEME',
  destroy: 'DESTROY',
};

export type PortkeyState = {
  theme?: 'dark' | 'light';
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
