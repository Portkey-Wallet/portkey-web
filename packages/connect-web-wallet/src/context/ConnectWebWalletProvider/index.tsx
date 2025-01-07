import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { IConnectState, WebWalletActions } from './actions';
import { BasicActions } from '../utils';
import { Updater } from './hooks/Init';
import { ModalProvider } from '../useModal';
import Modals from '../../Modals';

const INITIAL_STATE: IConnectState = {
  options: {
    theme: 'light',
    networkType: 'MAINNET',
    appId: 'wallet-appId',
  },
  provider: null,
};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function useWebWallet(): [IConnectState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: IConnectState, { type, payload }: any) {
  switch (type) {
    case WebWalletActions.destroy: {
      return INITIAL_STATE;
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function PortkeyWebWalletProvider({
  children,
  options,
}: {
  children: React.ReactNode;
} & { options: IConnectState['options'] }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <PortkeyContext.Provider value={useMemo(() => [{ ...state, options }, { dispatch }], [options, state])}>
      <ModalProvider>
        <Modals />
        <Updater />
        {children}
      </ModalProvider>
    </PortkeyContext.Provider>
  );
}
