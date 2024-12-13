import { useState, useMemo, useCallback } from 'react';
import { IUserTokenItemResponse } from '../components/types/assets';
import { ChainId } from '@portkey/types';
import {
  ChainInfo,
  TReceiveTokenMap,
  TReceiveFromNetworkItem,
  ReceiveFromNetworkServiceType,
  ReceiveType,
} from '@portkey/services';

export const useReceive = (token: IUserTokenItemResponse, initToChainId?: ChainId) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [destinationChain, setDestinationChain] = useState<ChainInfo | undefined>();
  const [destinationMap, setDestinationMap] = useState<TReceiveTokenMap | undefined>();
  const [sourceChain, setSourceChain] = useState<TReceiveFromNetworkItem | undefined>();
  // const destinationChainList = useMemo(() => {
  //   if (!destinationMap) return [];
  //   return Object.keys(destinationMap).map((chainId) => getChainInfoByChainId(chainId as ChainId));
  // }, [destinationMap, getChainInfoByChainId]);

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
};
