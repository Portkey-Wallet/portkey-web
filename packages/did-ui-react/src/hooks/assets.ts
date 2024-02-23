import { useCallback, useMemo, useState } from 'react';
import { usePortkeyAsset } from '../components';
import { ChainId } from '@portkey/types';
import { getChain } from './useChainInfo';
import { useThrottleFirstEffect } from './throttle';
import { ChainInfo } from '@portkey/services';
import { DEFAULT_TOKEN } from '../constants/assets';

const emptyArray: string[] = [];

export const useCheckSuffix = () => {
  const [{ caAddressInfos }] = usePortkeyAsset();

  const chainIdArray = useMemo(() => caAddressInfos?.map((ca) => ca.chainId) || emptyArray, [caAddressInfos]);

  return useCallback(
    (suffix: string) => {
      return chainIdArray.includes(suffix);
    },
    [chainIdArray],
  );
};

export function useDefaultToken(chainId?: ChainId) {
  const [chainInfo, setChainInfo] = useState<ChainInfo>();

  useThrottleFirstEffect(() => {
    if (!chainId) return;
    getChain(chainId).then(setChainInfo);
  }, []);

  return useMemo(() => chainInfo?.defaultToken || DEFAULT_TOKEN, [chainInfo?.defaultToken]);
}
