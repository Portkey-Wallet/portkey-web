import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { basicAssetView, AssetState, BaseAssetProps } from './actions';
import { BasicActions } from '../utils';
import { Updater } from './hooks/Init';

const INITIAL_STATE = {};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function usePortkeyAsset(): [AssetState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case basicAssetView.setDIDWallet.type: {
      console.log(payload, 'payload===');

      return Object.assign({}, state, { ...payload });
    }
    case basicAssetView.destroy.type: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

/**
 * @remarks
 *  If you used `did.save` after logging in and creating a CA account, you only need to enter the pin, you don't need to pass them (`managerPrivateKey`, `originChainId`, `caHash`)
 *  If you are not sure whether `did.save` was used, they must be entered
 * @param pin - `did.load` is the input pin
 * @param didStorageKeyName - `did.save(pin, didStorageKeyName)`
 * @param caHash - CA Hash
 * @param originChainId - Generate the ChainId of the CA account
 * @param managerPrivateKey - manager's private key
 * @returns
 */
export function PortkeyAssetProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & BaseAssetProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <PortkeyContext.Provider value={useMemo(() => [{ ...state, ...props }, { dispatch }], [props, state])}>
      <Updater />
      {children}
    </PortkeyContext.Provider>
  );
}
