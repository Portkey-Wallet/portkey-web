import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { AssetState, BaseAssetProps, PortkeyAssetActions } from './actions';
import { BasicActions } from '../utils';
import { Updater } from './hooks/Init';
import { NFTCollectionItemShowType } from '../../types/assets';
import { INftCollection } from '@portkey/services';

const INITIAL_STATE = {
  initialized: false,
};
const PortkeyContext = createContext<any>(INITIAL_STATE);

export function usePortkeyAsset(): [AssetState, BasicActions] {
  return useContext(PortkeyContext);
}

//reducer
function reducer(state: AssetState, { type, payload }: any) {
  switch (type) {
    case PortkeyAssetActions.setDIDWallet: {
      return Object.assign({}, state, { ...payload });
    }
    case PortkeyAssetActions.setGuardianList: {
      return Object.assign({}, state, payload);
    }
    case PortkeyAssetActions.setNFTCollections: {
      const { list, totalRecordCount, skipCount, maxResultCount, maxNFTCount } = payload;
      const collectionList: NFTCollectionItemShowType[] = (list as INftCollection[]).map((item) => ({
        isFetching: false,
        skipCount: 0,
        maxResultCount: maxNFTCount,
        totalRecordCount: 0,
        children: [],
        decimals: 0,
        ...item,
      }));
      // TODO Handle pagination requests
      state.NFTCollection = {
        skipCount,
        maxResultCount,
        totalRecordCount: totalRecordCount,
        list: collectionList,
      };

      return Object.assign({}, state);
    }
    case PortkeyAssetActions.setNFTItem: {
      if (!payload) return;
      const { list, totalRecordCount, symbol, chainId, skipCount } = payload;
      const currentNFTSeriesItem = state.NFTCollection?.list.find(
        (ele) => ele.symbol === symbol && ele.chainId === chainId,
      );
      if (currentNFTSeriesItem) {
        if (currentNFTSeriesItem?.children?.length > skipCount) return;
        currentNFTSeriesItem.children = [...currentNFTSeriesItem.children, ...list];
        currentNFTSeriesItem.skipCount = currentNFTSeriesItem.children.length;
        currentNFTSeriesItem.totalRecordCount = totalRecordCount;
        currentNFTSeriesItem.isFetching = false;
      }
      return Object.assign({}, state);
    }
    case PortkeyAssetActions.destroy: {
      return INITIAL_STATE;
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
