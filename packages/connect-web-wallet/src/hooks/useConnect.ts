import { useCallback, useMemo } from 'react';
import { useWebWallet } from '../context/ConnectWebWalletProvider';
import { IConnectParams } from '../context/types';
import { basicModalView } from '../context/useModal/actions';
import { useModalDispatch } from '../context/useModal/hooks';
import { MethodsBase, MethodsWallet } from '@portkey/provider-types';
import { useRequestMethod } from './useRequestMethod';

export const useConnect = () => {
  const [{ provider }] = useWebWallet();
  const dispatch = useModalDispatch();
  // connect: (options?: IConnectParams) => Promise<IUserInfo | undefined>;
  // disconnect: () => Promise<void>;

  const requestMethod = useRequestMethod();

  const connect = useCallback(
    async (options?: IConnectParams) => {
      if (!provider) throw 'Please init wallet provider';
      const isConnected = provider?.isConnected();
      console.log(isConnected, 'isConnected==');
      if (isConnected) return requestMethod({ method: MethodsBase.ACCOUNTS });
      dispatch(basicModalView.setWalletDialog.actions(true));
      const result = await requestMethod({
        method: MethodsBase.REQUEST_ACCOUNTS,
        payload: { a: 124 },
      });
      dispatch(basicModalView.setWalletDialog.actions(false));
      console.log(result, 'result===useConnect==connect');
      return result;
    },
    [dispatch, provider, requestMethod],
  );

  const disconnect = useCallback(async () => {
    const isConnected = provider?.isConnected();

    if (!isConnected) return null;
    const result = await requestMethod({
      method: MethodsWallet.WALLET_DISCONNECT,
    });
    console.log(result, 'result==');
    return result;
  }, [provider, requestMethod]);

  return useMemo(
    () => ({
      provider,
      connect,
      disconnect,
    }),
    [connect, disconnect, provider],
  );
};
