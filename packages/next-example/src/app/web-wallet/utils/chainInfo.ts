import { did } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';

export const getChainInfoMap = async () => {
  if (did.didWallet.chainsInfo) return did.didWallet.chainsInfo;
  const chainMap = await did.didWallet.getChainsInfo();
  return chainMap;
};

export const getChain = async (chainId: ChainId) => {
  const info = did.didWallet.chainsInfo?.[chainId];
  if (info) return info;
  return (await getChainInfoMap())[chainId];
};
