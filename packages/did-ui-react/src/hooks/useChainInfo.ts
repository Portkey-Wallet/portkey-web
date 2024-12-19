import type { ChainInfo } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { did } from '../utils';

type ChainMapType = { [key in ChainId]: ChainInfo };

export const getChainInfo = async (originChainId?: ChainId) => {
  const chainList = await did.services.getChainsInfo();
  const chainMap = {} as ChainMapType;
  chainList.forEach((chain) => (chainMap[chain.chainId as ChainId] = chain));
  if (originChainId) return chainMap[originChainId];
  throw Error(`The current network does not support the ChainId '${originChainId}'`);
};

export const getChain = async (chainId: ChainId) => {
  const info = did.didWallet.chainsInfo?.[chainId];
  if (info) return info;
  return getChainInfo(chainId);
};
