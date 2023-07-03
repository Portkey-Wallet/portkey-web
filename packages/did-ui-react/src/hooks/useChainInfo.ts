import type { ChainInfo } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { SET_SERVICE_CONFIG } from '../constants/events';
import { OnErrorFunc } from '../types';
import { eventBus } from '../utils';
import { did } from '../utils';

type ChainMapType = { [key in ChainId]: ChainInfo };

const useChainInfo = (chainId: ChainId, onError?: OnErrorFunc) => {
  const [chainMap, setChainMap] = useState<ChainMapType>();

  const getChainList = useCallback(
    async (originChainId?: ChainId) => {
      try {
        const chainList = await did.services.getChainsInfo();
        const chainMap = {} as ChainMapType;
        chainList.forEach((chain) => (chainMap[chain.chainId] = chain));
        setChainMap(chainMap);
        if (originChainId) return chainMap[originChainId];
      } catch (error: any) {
        return onError?.({ errorFields: 'getChainList', error });
      }
    },
    [onError],
  );

  useEffect(() => {
    getChainList();
  }, [getChainList]);

  const setHandler = useCallback(() => {
    getChainList();
  }, [getChainList]);

  useEffect(() => {
    eventBus.addListener(SET_SERVICE_CONFIG, setHandler);
    return () => {
      eventBus.removeListener(SET_SERVICE_CONFIG, setHandler);
    };
  }, [setHandler]);

  return useMemo(() => chainMap?.[chainId], [chainId, chainMap]);
};

export default useChainInfo;

export const getChainInfo = async (originChainId?: ChainId) => {
  const chainList = await did.services.getChainsInfo();
  const chainMap = {} as ChainMapType;
  chainList.forEach((chain) => (chainMap[chain.chainId] = chain));
  if (originChainId) return chainMap[originChainId];
};
