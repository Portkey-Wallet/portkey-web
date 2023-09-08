import { ChainId } from '@portkey/types';
import { useCallback, useRef } from 'react';
import { getHolderInfoByContract } from '../utils/sandboxUtil/getHolderInfo';
import { usePortkey } from '../components/context';

export const useCheckManagerSyncState = () => {
  const [{ chainType }] = usePortkey();

  const isSync = useRef<{
    [x: string]: boolean;
  }>({});

  return useCallback(
    async (chainId: ChainId, caHash: string, managementAddress: string) => {
      const key = `${chainId}${caHash}${managementAddress}`;
      try {
        if (isSync.current[key]) return true;
        const info = await getHolderInfoByContract({
          chainId,
          chainType,
          paramsOption: {
            caHash,
          },
        });
        if (!info) return false;
        const { managerInfos } = info;
        if (managerInfos.some((item) => item.address === managementAddress)) {
          isSync.current[key] = true;
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [chainType],
  );
};
