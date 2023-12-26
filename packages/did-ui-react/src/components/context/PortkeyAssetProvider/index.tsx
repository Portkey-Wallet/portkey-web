import React, { createContext, useContext, useMemo, useReducer } from 'react';
import {
  ActivityStateMap,
  ActivityStateMapAttributes,
  AssetState,
  BaseAssetProps,
  PortkeyAssetActions,
  WalletInfo,
} from './actions';
import { BasicActions, getUpdateList } from '../utils';
import { Updater } from './hooks/Init';
import { NFTCollectionItemShowType } from '../../types/assets';
import { INftCollection } from '@portkey-v1/services';
import { randomId } from '@portkey-v1/utils';
import { ChainId } from '@portkey-v1/types';
import { getCurrentActivityMapKey } from '../../Activity/utils';

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
      return Object.assign({}, state, { ...payload, accountInfo: { ...state.accountInfo, ...payload.accountInfo } });
    }
    case PortkeyAssetActions.setTxFee: {
      state.txFee = { ...state.txFee, ...payload.txFee };
      return Object.assign({}, state);
    }
    case PortkeyAssetActions.setCAInfo: {
      const caInfo = payload.caInfo as Required<WalletInfo>['caInfo'];
      if (!caInfo) return state;
      const caAddressInfos = Object.entries(caInfo).map(([chainId, info]) => ({
        chainId: chainId as ChainId,
        caAddress: info.caAddress,
      }));
      return Object.assign({}, state, { caInfo, caAddressInfos });
    }
    case PortkeyAssetActions.setGuardianList: {
      return Object.assign({}, state, payload);
    }
    case 'setActivityList': {
      const {
        totalRecordCount,
        skipCount,
        maxResultCount,
        chainId,
        symbol,
        isUpdate = false,
      } = payload as ActivityStateMapAttributes;
      const currentMapKey = getCurrentActivityMapKey(chainId, symbol);
      const activityMap = (state?.activityMap ?? {}) as ActivityStateMap;
      if (totalRecordCount !== 0) {
        const list = getUpdateList(isUpdate, totalRecordCount, activityMap?.[currentMapKey]?.list);
        list.splice(skipCount, payload.list.length, ...payload.list);
        activityMap[currentMapKey] = {
          list,
          totalRecordCount,
          skipCount,
          maxResultCount,
          chainId,
          symbol,
        };
      } else {
        activityMap[currentMapKey] = {
          list: [],
          totalRecordCount,
          skipCount,
          maxResultCount,
          chainId,
          symbol,
        };
      }
      return Object.assign({}, state, { activityMap });
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
      state.NFTCollection.updateRandom = randomId();
      return Object.assign({}, state);
    }
    case PortkeyAssetActions.setNFTItem: {
      if (!payload) return state;
      const { list, totalRecordCount, symbol, chainId, skipCount } = payload;
      if (!state.NFTCollection?.list) return state;
      const currentNFTIndex = state.NFTCollection.list.findIndex(
        (ele) => ele.symbol === symbol && ele.chainId === chainId,
      );
      if (currentNFTIndex !== -1) {
        const currentNFTSeriesItem = state.NFTCollection.list[currentNFTIndex];
        if (!currentNFTSeriesItem) return state;
        if (currentNFTSeriesItem?.children?.length > skipCount) return state;
        currentNFTSeriesItem.children = [...currentNFTSeriesItem.children, ...list];
        currentNFTSeriesItem.skipCount = currentNFTSeriesItem.children.length;
        currentNFTSeriesItem.totalRecordCount = totalRecordCount;
        currentNFTSeriesItem.isFetching = false;
        state.NFTCollection.list[currentNFTIndex] = currentNFTSeriesItem;
        state.NFTCollection.updateRandom = randomId();
      }
      return Object.assign({}, state);
    }
    case PortkeyAssetActions.setTokenPrice: {
      if (!payload) return state;
      const { list } = payload;
      const tokenPrices = state.tokenPrices ?? { tokenPriceObject: {} };
      list.map((ele: { symbol: string; priceInUsd: number }) => {
        tokenPrices.tokenPriceObject[ele.symbol] = ele.priceInUsd;
      });
      state.tokenPrices = tokenPrices;
      return Object.assign({}, { ...state });
    }
    case PortkeyAssetActions.setAllAssets: {
      if (!payload) return state;
      return Object.assign({}, { ...state, allAsset: payload });
    }

    case PortkeyAssetActions.destroy: {
      return INITIAL_STATE;
    }
    default: {
      // const { destroy } = payload;
      // if (destroy) return Object.assign({}, payload);
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
