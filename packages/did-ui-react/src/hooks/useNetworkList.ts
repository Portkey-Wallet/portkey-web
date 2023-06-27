import { useState, useEffect, useCallback, useMemo } from 'react';
import { SET_NETWORK_INFO, SET_NETWORK } from '../constants/events';
import { did, eventBus } from '../utils';
import ConfigProvider from '../components/config-provider';
import { NetworkInfo } from '../types';

export default function useNetworkList() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(ConfigProvider.config?.network);

  const setHandler = useCallback(
    (networkType: string) => {
      const networkItem = networkInfo?.networkList?.find((item) => item.networkType === networkType);
      if (networkItem) {
        did.setConfig({
          graphQLUrl: networkItem['graphQLUrl'],
          requestDefaults: {
            ...did.config.requestDefaults,
            baseURL: networkItem['apiUrl'],
          },
        });
        setNetworkInfo((v) => ({ ...v, defaultNetwork: networkType }));
      }
    },
    [networkInfo?.networkList],
  );

  const setNetworkHandler = useCallback(
    (v: NetworkInfo) => {
      setNetworkInfo(v);
      v.defaultNetwork && setHandler(v.defaultNetwork);
    },
    [setHandler],
  );

  useEffect(() => {
    eventBus.addListener(SET_NETWORK_INFO, setNetworkHandler);
    return () => {
      eventBus.removeListener(SET_NETWORK_INFO, setNetworkHandler);
    };
  }, [setNetworkHandler]);

  useEffect(() => {
    eventBus.addListener(SET_NETWORK, setHandler);
    return () => {
      eventBus.removeListener(SET_NETWORK, setHandler);
    };
  }, [setHandler]);

  return useMemo(
    () => ({
      network: networkInfo.defaultNetwork,
      networkList: networkInfo.networkList,
    }),
    [networkInfo.defaultNetwork, networkInfo.networkList],
  );
}
