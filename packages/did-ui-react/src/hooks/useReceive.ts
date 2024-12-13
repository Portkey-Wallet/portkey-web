import { useState, useMemo, useCallback, useEffect } from 'react';
import { IUserTokenItemResponse } from '../components/types/assets';
import { ChainId } from '@portkey/types';
import {
  ChainInfo,
  TReceiveTokenMap,
  TReceiveFromNetworkItem,
  ReceiveFromNetworkServiceType,
  ReceiveType,
} from '@portkey/services';
import { did } from '../utils';

export const useReceive = (token: IUserTokenItemResponse, initToChainId?: ChainId) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [destinationChain, setDestinationChain] = useState<ChainInfo | undefined>();
  const [destinationMap, setDestinationMap] = useState<TReceiveTokenMap | undefined>();
  const [sourceChain, setSourceChain] = useState<TReceiveFromNetworkItem | undefined>();
  const [chainList, setChainList] = useState<ChainInfo[]>([]);

  const getChainInfo = useCallback(
    (chainId: ChainId) => {
      if (!chainList) return undefined;
      return chainList.find((chain) => chain.chainId === chainId);
    },
    [chainList],
  );
  const destinationChainList = useMemo(() => {
    if (!destinationMap) return [];
    return Object.keys(destinationMap).map((chainId) => getChainInfo(chainId as ChainId));
  }, [destinationMap, getChainInfo]);

  const sourceChainList = useMemo(() => {
    if (!destinationMap) return [];
    if (!destinationChain) return [];
    return destinationMap[destinationChain.chainId].filter((item) => {
      return !(
        item.serviceList &&
        item.serviceList.length === 1 &&
        item.serviceList[0].serviceName === ReceiveFromNetworkServiceType.EBridge
      );
    });
  }, [destinationChain, destinationMap]);

  const isAelfChain = useCallback((chainName?: string) => {
    if (!chainName) return false;
    const chainIdList: ChainId[] = ['AELF', 'tDVV', 'tDVW'];
    return chainIdList.find((item) => {
      return item === chainName;
    });
  }, []);

  const receiveType = useMemo(() => {
    if (isAelfChain(sourceChain?.network)) {
      return ReceiveType.Portkey;
    } else if (sourceChain?.serviceList && sourceChain?.serviceList.length > 0) {
      const serviceName = sourceChain?.serviceList[0].serviceName;
      if (serviceName == ReceiveFromNetworkServiceType.ETransfer) {
        return ReceiveType.ETransfer;
      } else if (serviceName == ReceiveFromNetworkServiceType.EBridge) {
        return ReceiveType.EBridge;
      }
    }
    return ReceiveType.Portkey;
  }, [isAelfChain, sourceChain?.network, sourceChain?.serviceList]);

  useEffect(() => {
    did.services.getChainsInfo().then((chainList) => {
      setChainList(chainList);
    });
  }, []);
  // request date and set loading status
  useEffect(() => {
    if (!chainList.length) return;
    setErrorMsg('');
    setLoading(true);
    did.services.receive
      .getReceiveNetworkList({
        symbol: token.symbol,
      })
      .then((data) => {
        if (data && data.data && data.data.destinationMap) {
          setDestinationMap(data.data.destinationMap);
        } else {
          setErrorMsg(data.message ?? 'Response data error');
        }
        setLoading(false);
      })
      .catch((e) => {
        console.log('destinationMap error: ', e);
        setErrorMsg(e.message);
        setLoading(false);
      });
  }, [token.symbol, chainList]);

  useEffect(() => {
    if (!destinationMap) return;
    let toChainId = initToChainId;
    if (!toChainId) toChainId = Object.keys(destinationMap)[0] as ChainId;
    setDestinationChain(getChainInfo(toChainId));
    if (destinationMap[toChainId]?.length) {
      setSourceChain(
        destinationMap[toChainId].find((item) => item.network == toChainId) ?? destinationMap[toChainId][0],
      ); // set same network as source chain
    }
  }, [destinationMap, getChainInfo, initToChainId]);

  const updateDestinationChain = useCallback(
    (targetChain?: ChainInfo) => {
      if (!targetChain) return;
      if (!destinationMap) return;
      if (targetChain.chainId === destinationChain?.chainId) return;
      setDestinationChain(targetChain);
      if (destinationMap[targetChain.chainId]?.length) {
        const isSourceChainExistInNewDestination = destinationMap[targetChain.chainId].find((item) => {
          return item.network === sourceChain?.network;
        });
        !isSourceChainExistInNewDestination && setSourceChain(destinationMap[targetChain.chainId][0]);
      }
    },
    [destinationChain?.chainId, destinationMap, sourceChain?.network],
  );

  return {
    loading,
    errorMsg,
    destinationChain,
    updateDestinationChain,
    destinationChainList,
    sourceChain,
    setSourceChain,
    sourceChainList,
    destinationMap,
    receiveType,
  };
};
