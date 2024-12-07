import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { basicPortkeyView, PortkeyState } from './actions';
import { BasicActions } from './utils';
import { Theme } from '../types';
import { ChainType } from '@portkey/types';
import { NetworkType } from '../../types';
import { useEffectOnce } from 'react-use';
import { did } from '../../utils';
import ConfigProvider from '../config-provider';
import { initConfig } from './initConfig';
import { initTheme } from '../../assets/theme';

const INITIAL_STATE = {
  theme: 'light',
  chainType: 'aelf',
};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function usePortkey(): [PortkeyState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case basicPortkeyView.destroy.type: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export interface ProviderProps {
  theme?: Theme;
  /** @alpha Required when running on chrome extension */
  sandboxId?: string;
  chainType?: ChainType;
  networkType: NetworkType;
  children: React.ReactNode;
}
export default function Provider({ theme, chainType, sandboxId, networkType, children }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  useEffectOnce(() => {
    initConfig();
    if (did.config.storageMethod) {
      ConfigProvider.setGlobalConfig({});
    }
  });

  useEffect(() => {
    ConfigProvider.setGlobalConfig({ networkType });
  }, [networkType]);
  useEffect(() => {
    initTheme(theme);
  }, [theme]);

  return (
    <PortkeyContext.Provider
      value={useMemo(
        () => [{ ...state, theme, networkType, chainType, sandboxId }, { dispatch }],
        [state, theme, networkType, chainType, sandboxId],
      )}>
      {children}
    </PortkeyContext.Provider>
  );
}
