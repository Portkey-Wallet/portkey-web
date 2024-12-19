import type { ChainInfo } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { did } from '../utils';
import { useCallback, useState } from 'react';
import { useEffectOnce } from 'react-use';

type ChainMapType = { [key in ChainId]: ChainInfo };

export const getChainInfo = async (originChainId?: ChainId) => {
  const chainList = await did.services.getChainsInfo();
  const chainMap = {} as ChainMapType;
  chainList.forEach((chain) => (chainMap[chain.chainId] = chain));
  if (originChainId) return chainMap[originChainId];
  throw Error(`The current network does not support the ChainId '${originChainId}'`);
};

export const getChain = async (chainId: ChainId) => {
  const info = did.didWallet.chainsInfo?.[chainId];
  if (info) return info;
  return getChainInfo(chainId);
};

export const useCurrentChainList = (): {
  chainList: ChainInfo[];
  getChainList: () => Promise<any>;
} => {
  const [chainList, setChainList] = useState<ChainInfo[]>([]);

  const getChainList = useCallback(async () => {
    try {
      const chainList = await did.services.getChainsInfo();
      setChainList(chainList);
    } catch (error) {
      console.warn('getChainList error', error);
    }
  }, []);

  useEffectOnce(() => {
    getChainList();
  });

  return { chainList, getChainList };
};
