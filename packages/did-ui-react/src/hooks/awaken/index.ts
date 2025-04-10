import { usePortkey } from '../../components/context';
import { LIMIT_CONTRACT_ADDRESS, SWAP_HOOK_CONTRACT_ADDRESS_MAP } from '../../constants/awaken';
import { SERVICE_AUTH_CHANGE } from '../../constants/events';
import { eventBus } from '../../utils';
import { useAwakenTokenList, useInitAwakenGasFeeState } from './state';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useInitAwaken = () => {
  useInitAwakenGasFeeState();
  const { refresh } = useAwakenTokenList();

  const initWithAuth = useCallback(() => {
    refresh();
  }, [refresh]);

  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    eventBus.on(SERVICE_AUTH_CHANGE, () => {
      setIsAuth(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    initWithAuth();
  }, [initWithAuth, isAuth]);
};

export const useSwapHookContractAddress = () => {
  const [{ networkType }] = usePortkey();
  return useMemo(() => SWAP_HOOK_CONTRACT_ADDRESS_MAP[networkType], [networkType]);
};

export const useLimitContractAddress = () => {
  const [{ networkType }] = usePortkey();
  return useMemo(() => LIMIT_CONTRACT_ADDRESS[networkType], [networkType]);
};
