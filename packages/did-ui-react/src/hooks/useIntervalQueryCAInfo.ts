import { useState, useMemo } from 'react';
import { CAInfo } from '@portkey/did';
import { ChainId } from '@portkey/types';
import { did } from '../utils';
import useInterval from './useInterval';

export function useIntervalQueryCAInfo({ address }: { address?: string; chainId?: ChainId }) {
  const [info, setInfo] = useState<{ info: CAInfo; chainId: ChainId }>();
  const caInfo = useMemo(() => (address && info ? info : undefined), [info, address]);
  const intervalHandler = useInterval(
    async () => {
      if (!address || caInfo) return;
      try {
        const result = await did.getHolderInfo({
          manager: address,
        });
        const { caAddress, caHash, originChainId } = result[0];
        if (caAddress && caHash)
          setInfo({
            info: {
              caAddress,
              caHash,
            },
            chainId: originChainId as any,
          });
      } catch (error) {
        console.log(error, '=====error');
      }
    },
    3000,
    [caInfo, address],
  );
  return [caInfo, intervalHandler] as const;
}
