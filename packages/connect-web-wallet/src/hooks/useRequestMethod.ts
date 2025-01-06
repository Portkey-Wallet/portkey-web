import { useCallback } from 'react';
import { useWebWallet } from '../context/ConnectWebWalletProvider';
import { IProvider } from '@portkey/provider-types';
import { basicModalView } from '../context/useModal/actions';
import { useModalDispatch } from '../context/useModal/hooks';

export const useRequestMethod = (): IProvider['request'] => {
  const [{ provider }] = useWebWallet();
  const dispatch = useModalDispatch();

  return useCallback(
    <T>(params: any) => {
      if (!provider) throw 'Wallet not init';
      const isConnected = provider?.isConnected();
      if (!isConnected) dispatch(basicModalView.setWalletDialog.actions(true));

      return provider?.request<T>(params);
    },
    [dispatch, provider],
  );
};
