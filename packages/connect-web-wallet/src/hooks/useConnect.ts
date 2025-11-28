import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useWebWallet } from '../context/ConnectWebWalletProvider';
import { IConnectParams } from '../context/types';
import { MethodsBase, MethodsWallet } from '@portkey/provider-types';
import { useRequestMethod } from './useRequestMethod';
import { TWalletInfo, WalletInfoControl } from '../utils/localWalletInfo';
import { sleep } from '@portkey/utils';

export const useConnect = () => {
  const [{ provider }] = useWebWallet();
  const [walletInfo, setWalletInfo] = useState<TWalletInfo | null>();
  // const dispatch = useModalDispatch();
  // const checkIdentifier = useCheckIdentifier();
  // connect: (options?: IConnectParams) => Promise<IUserInfo | undefined>;
  // disconnect: () => Promise<void>;

  const requestMethod = useRequestMethod();

  const getAndSetLocalWalletInfo = useCallback(async () => {
    const isConnected = provider?.isConnected();
    if (!isConnected) throw 'Please connect wallet';
    await sleep(1000);

    const walletInfo = await requestMethod({
      method: MethodsBase.WALLET_INFO,
    });

    WalletInfoControl.setWalletInfo(walletInfo as TWalletInfo);
    setWalletInfo(walletInfo);
  }, [provider, requestMethod]);

  const connect = useCallback(
    async (options?: IConnectParams) => {
      if (!provider) throw 'Please init wallet provider';

      const walletState = await requestMethod({ method: MethodsWallet.GET_WALLET_STATE });

      console.log('connect walletState', walletState);

      if (walletState?.isConnected && walletState?.isLogged) return requestMethod({ method: MethodsBase.ACCOUNTS });

      const result = await requestMethod({
        method: MethodsBase.REQUEST_ACCOUNTS,
        payload: options,
      });

      getAndSetLocalWalletInfo();

      // dispatch(basicModalView.setWalletDialog.actions(false));
      console.log(result, 'result===useConnect==connect');
      return result;
    },
    [getAndSetLocalWalletInfo, provider, requestMethod],
  );

  const disconnect = useCallback(async () => {
    const isConnected = provider?.isConnected();

    if (!isConnected) return null;
    const result = await requestMethod({
      method: MethodsWallet.WALLET_DISCONNECT,
    });

    WalletInfoControl.resetWalletInfo();
    setWalletInfo(null);

    console.log(result, 'result==');
    return result;
  }, [provider, requestMethod]);

  const showAsset = useCallback(async () => {
    const isConnected = provider?.isConnected();

    if (!isConnected) throw 'Please connect wallet';
    await requestMethod({
      method: MethodsWallet.WALLET_SHOW_ASSETS,
    });
  }, [provider, requestMethod]);

  useLayoutEffect(() => {
    const _info = WalletInfoControl.getWalletInfo();
    setWalletInfo(_info);
  }, []);

  return useMemo(
    () => ({
      provider,
      connect,
      disconnect,
      showAsset,
      walletInfo,
    }),
    [connect, disconnect, provider, showAsset, walletInfo],
  );
};
