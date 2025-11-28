import { FetchRequest } from '@portkey/request';
import { AwakenService } from '@portkey/services';
import { useIsMainnet } from '../common';
import { useCallback, useMemo } from 'react';
import { NetworkType } from '../../types';
import { AWAKEN_SERVICE_URL } from '../../constants/awaken';
import { useDAppChainId } from '../useChainInfo';
import { TGetAwakenTokenPriceParams } from '@portkey/services/dist/commonjs/dappService/awakenService/types';

const awakenServiceMap: Record<string, AwakenService> = {};

const getAwakenService = (isMainnet: boolean) => {
  const key: NetworkType = isMainnet ? 'MAINNET' : 'TESTNET';
  if (awakenServiceMap[key]) return awakenServiceMap[key];
  const awakenFetchRequest = new FetchRequest({
    baseURL: AWAKEN_SERVICE_URL[key],
  });
  const awakenService = new AwakenService(awakenFetchRequest);
  awakenServiceMap[key] = awakenService;
  return awakenService;
};

export const useAwakenService = () => {
  const isMainnet = useIsMainnet();
  return useMemo(() => getAwakenService(isMainnet), [isMainnet]);
};

type TGetSwapRoutesParams = {
  symbolIn: string;
  symbolOut: string;
  isFocusValueIn: boolean;
  amountIn?: string;
  amountOut?: string;
};

export const useGetSwapRoutes = () => {
  const service = useAwakenService();
  const dAppChainId = useDAppChainId();

  return useCallback(
    async ({ symbolIn, symbolOut, isFocusValueIn, amountIn, amountOut }: TGetSwapRoutesParams) => {
      const res = await service.getSwapRoutes({
        chainId: dAppChainId,
        symbolIn,
        symbolOut,
        routeType: isFocusValueIn ? 0 : 1,
        amountIn,
        amountOut,
      });
      if (!res) throw new Error('no swap route');
      return res?.data;
    },
    [dAppChainId, service],
  );
};

export const useGetAwakenGasFee = () => {
  const service = useAwakenService();

  return useCallback(async (): Promise<number | undefined> => {
    const res = await service.getAwakenGasFee();
    return res?.data?.transactionFee;
  }, [service]);
};

export const useGetAwakenTokenPrice = () => {
  const service = useAwakenService();

  return useCallback(
    async (params: TGetAwakenTokenPriceParams): Promise<string | undefined> => {
      const res = await service.getAwakenTokenPrice(params);
      return res.data;
    },
    [service],
  );
};
