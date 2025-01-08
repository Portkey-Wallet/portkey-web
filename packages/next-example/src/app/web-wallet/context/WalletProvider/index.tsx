import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { IWebWalletState, WebWalletActions } from './actions';
import { BasicActions } from '../utils';
import { ServiceWorker } from './hooks/Init';

const INITIAL_STATE: IWebWalletState = {
  pageState: null,
  options: {
    theme: 'dark',
    networkType: 'MAINNET',
    appId: 'wallet-appId',
    isTelegram: false,
  },
};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function useWebWallet(): [IWebWalletState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: IWebWalletState, { type, payload }: any) {
  switch (type) {
    case WebWalletActions.destroy: {
      return INITIAL_STATE;
    }
    case WebWalletActions.setWalletOptions: {
      state.options = { ...state.options, ...payload.options };
      return Object.assign({}, state);
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <PortkeyContext.Provider value={useMemo(() => [{ ...state }, { dispatch }], [state])}>
      <ServiceWorker />
      {children}
    </PortkeyContext.Provider>
  );
}
