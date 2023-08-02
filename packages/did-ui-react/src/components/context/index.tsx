import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { basicPortkeyView, PortkeyState } from './actions';
import { BasicActions } from './utils';
import { Theme } from '../types';
import { ChainType } from '@portkey/types';
import { NetworkType } from '../../types';

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

export default function Provider({
  theme,
  chainType,
  sandboxId,
  networkType,
  children,
}: {
  theme?: Theme;
  sandboxId?: string;
  chainType?: ChainType;
  networkType: NetworkType;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

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
