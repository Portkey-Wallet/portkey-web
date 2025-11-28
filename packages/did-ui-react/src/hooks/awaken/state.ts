import { useCallback, useEffect, useMemo } from 'react';
import { useGetAwakenGasFee, useGetAwakenTokenPrice } from './request';
import { handleLoopFetch } from '@portkey/utils';
import { useEffectOnce } from 'react-use';
import { DEFAULT_EXPIRATION, DEFAULT_SLIPPAGE_TOLERANCE } from '../../constants/awaken';
import { BaseAsyncStorage } from '../../utils';
import { getChain, useDAppChainId } from '../useChainInfo';
import { TCurrency } from '@portkey/types';
import { usePortkeyAsset } from '../../components';
import { did } from '@portkey/did';

type TAwakenState = {
  awakenGasFee: number;
  userSlippageTolerance: string;
  userExpiration: string;
  tokenPrices: Record<string, string>;
  tokenList: TCurrency[];
};
const AwakenState: TAwakenState = {
  awakenGasFee: 480000,
  userSlippageTolerance: DEFAULT_SLIPPAGE_TOLERANCE,
  userExpiration: DEFAULT_EXPIRATION,
  tokenPrices: {},
  tokenList: [],
};

const USER_SLIPPAGE_TOLERANCE_KEY = 'userSlippageTolerance';
const USER_EXPIRATION_KEY = 'userExpiration';

export const useAwakenGasFee = () => {
  return useMemo(() => AwakenState.awakenGasFee, []);
};

export const useInitAwakenGasFeeState = () => {
  const getAwakenGasFee = useGetAwakenGasFee();

  const init = useCallback(async () => {
    try {
      const gasFee = await handleLoopFetch({
        fetch: getAwakenGasFee,
        times: 5,
      });
      if (!gasFee) return;
      AwakenState.awakenGasFee = gasFee;
    } catch (error) {
      console.log('useInitAwakenGasFeeState error', error);
    }
  }, [getAwakenGasFee]);

  useEffectOnce(() => {
    init();
  });
};

const storage = new BaseAsyncStorage();
export const useAwakenUserSlippageTolerance = () => {
  const init = useCallback(async () => {
    try {
      const userSlippageToleranceStr = await storage.getItem(USER_SLIPPAGE_TOLERANCE_KEY);
      if (userSlippageToleranceStr) {
        const _userSlippageTolerance = JSON.parse(userSlippageToleranceStr);
        AwakenState.userSlippageTolerance = _userSlippageTolerance;
      }
    } catch (error) {
      console.log('useAwakenUserSlippageTolerance init', error);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const update = useCallback((val: string) => {
    try {
      AwakenState.userSlippageTolerance = val;
      storage.setItem(USER_SLIPPAGE_TOLERANCE_KEY, JSON.stringify(val));
    } catch (error) {
      console.log('useAwakenUserSlippageTolerance update', error);
    }
  }, []);

  return {
    userSlippageTolerance: AwakenState.userSlippageTolerance,
    update,
  };
};

export const useAwakenUserExpiration = () => {
  const init = useCallback(async () => {
    try {
      const userExpirationStr = await storage.getItem(USER_EXPIRATION_KEY);
      if (userExpirationStr) {
        const _userExpiration = JSON.parse(userExpirationStr);
        AwakenState.userExpiration = _userExpiration;
      }
    } catch (error) {
      console.log('useAwakenUserExpiration init', error);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const update = useCallback((val: string) => {
    try {
      AwakenState.userExpiration = val;
      storage.setItem(USER_EXPIRATION_KEY, JSON.stringify(val));
    } catch (error) {
      console.log('useAwakenUserExpiration update', error);
    }
  }, []);

  return {
    userExpiration: AwakenState.userExpiration,
    update,
  };
};

export type TUseAwakenTokenPricesParams = {
  symbol?: string;
  isInit?: boolean;
};
export const useAwakenTokenPrices = ({ symbol, isInit = true }: TUseAwakenTokenPricesParams) => {
  const dAppChainId = useDAppChainId();
  const key = useMemo(() => `${dAppChainId}_${symbol}`, [dAppChainId, symbol]);
  const getAwakenTokenPrice = useGetAwakenTokenPrice();

  const price = useMemo<string>(() => AwakenState.tokenPrices[key] || '0', [key]);

  const refresh = useCallback(async () => {
    if (!symbol) return;
    const chainInfo = await getChain(dAppChainId);
    const rst = await getAwakenTokenPrice({
      chainId: dAppChainId,
      symbol,
      tokenAddress: chainInfo.defaultToken.address,
    });
    if (!rst) return;

    AwakenState.tokenPrices[key] = rst;
  }, [symbol, dAppChainId, getAwakenTokenPrice, key]);

  useEffect(() => {
    isInit && refresh();
  }, [isInit, refresh]);

  return {
    price,
    refresh,
  };
};

export const useAwakenTokenList = (isInit = false) => {
  const chainId = useDAppChainId();
  const [{ caInfo }] = usePortkeyAsset();

  const refresh = useCallback(async () => {
    const rst = await did.services.assets.getAwakenTokenList({
      skipCount: 0,
      maxResultCount: 1000,
      page: 1,
      chainId,
      caAddress: caInfo?.[chainId]?.caAddress || '',
    });
    AwakenState.tokenList = rst.data;
  }, [caInfo, chainId]);

  useEffect(() => {
    if (!isInit) return;
    refresh();
  }, [isInit, refresh]);

  return { list: AwakenState.tokenList, refresh };
};
