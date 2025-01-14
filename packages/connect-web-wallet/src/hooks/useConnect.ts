import { useCallback, useMemo } from 'react';
import { useWebWallet } from '../context/ConnectWebWalletProvider';
import { IConnectParams } from '../context/types';
import { MethodsBase, MethodsWallet } from '@portkey/provider-types';
import { useRequestMethod } from './useRequestMethod';
import { TWalletInfo, WalletInfoControl } from '../utils/localWalletInfo';

export const useConnect = () => {
  const [{ provider }] = useWebWallet();
  // const dispatch = useModalDispatch();
  // const checkIdentifier = useCheckIdentifier();
  // connect: (options?: IConnectParams) => Promise<IUserInfo | undefined>;
  // disconnect: () => Promise<void>;

  const requestMethod = useRequestMethod();

  const connect = useCallback(
    async (options?: IConnectParams) => {
      if (!provider) throw 'Please init wallet provider';
      const isConnected = provider?.isConnected();
      console.log(isConnected, 'isConnected==');
      if (isConnected) return requestMethod({ method: MethodsBase.ACCOUNTS });

      const result = await requestMethod({
        method: MethodsBase.REQUEST_ACCOUNTS,
        payload: options,
      });

      const walletInfo = await requestMethod({
        method: MethodsWallet.WALLET_INFO,
      });

      WalletInfoControl.setWalletInfo(walletInfo as TWalletInfo);

      // dispatch(basicModalView.setWalletDialog.actions(false));
      console.log(result, 'result===useConnect==connect');
      return result;
    },
    [provider, requestMethod],
  );

  const disconnect = useCallback(async () => {
    const isConnected = provider?.isConnected();

    if (!isConnected) return null;
    const result = await requestMethod({
      method: MethodsWallet.WALLET_DISCONNECT,
    });

    WalletInfoControl.resetWalletInfo();

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
