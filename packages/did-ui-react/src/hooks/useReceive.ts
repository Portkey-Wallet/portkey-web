import { useState, useMemo, useCallback, useEffect } from 'react';
import AElf from 'aelf-sdk';
import { BaseToken } from '../components/types/assets';
import { ChainId } from '@portkey/types';
import {
  ChainInfo,
  TReceiveTokenMap,
  TReceiveFromNetworkItem,
  ReceiveFromNetworkServiceType,
  ReceiveType,
  TDepositInfo,
} from '@portkey/services';
import { did } from '../utils';
import { usePortkeyAsset } from '../components/context/PortkeyAssetProvider';
import { FetchRequest } from '@portkey/request';
import { ec } from 'elliptic';

export const useReceive = (token: BaseToken) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [destinationChain, setDestinationChain] = useState<ChainInfo>();
  const [destinationMap, setDestinationMap] = useState<TReceiveTokenMap>();
  const [sourceChain, setSourceChain] = useState<TReceiveFromNetworkItem>();
  const [chainList, setChainList] = useState<ChainInfo[]>([]);

  const getChainInfo = useCallback(
    (chainId: ChainId) => {
      return chainList.find((chain) => chain.chainId === chainId);
    },
    [chainList],
  );
  const destinationChainList = useMemo(() => {
    if (!destinationMap) return [];
    if (!chainList) return [];
    return Object.keys(destinationMap).map((chainId) => getChainInfo(chainId as ChainId));
  }, [chainList, destinationMap, getChainInfo]);

  const sourceChainList = useMemo(() => {
    if (!destinationMap) return [];
    if (!destinationChain) return [];
    return destinationMap[destinationChain.chainId as ChainId].filter((item) => {
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
    const toChainId: ChainId = token.symbol === 'ELF' ? 'AELF' : 'tDVW';
    setDestinationChain(getChainInfo(toChainId));
    if (destinationMap[toChainId]?.length) {
      setSourceChain(
        destinationMap[toChainId].find((item) => item.network == toChainId) ?? destinationMap[toChainId][0],
      ); // set same network as source chain
    }
  }, [destinationMap, getChainInfo, token.symbol]);

  const updateDestinationChain = useCallback(
    (targetChain?: ChainInfo) => {
      if (!targetChain) return;
      if (!destinationMap) return;
      if (targetChain.chainId === destinationChain?.chainId) return;
      setDestinationChain(targetChain);
      const targetChainId = targetChain.chainId as ChainId;
      if (destinationMap[targetChainId]?.length) {
        const isSourceChainExistInNewDestination = destinationMap[targetChainId].find((item) => {
          return item.network === sourceChain?.network;
        });
        !isSourceChainExistInNewDestination && setSourceChain(destinationMap[targetChainId][0]);
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

export const useReceiveByETransfer = ({
  toChainId,
  toSymbol,
  fromNetwork,
  fromSymbol,
  receiveType,
}: {
  toChainId: ChainId;
  toSymbol: string;
  fromNetwork: string;
  fromSymbol: string;
  receiveType: string;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [depositInfo, setDepositInfo] = useState<TDepositInfo | undefined>();
  const [{ managementAccount, originChainId, caHash }] = usePortkeyAsset();
  const address = managementAccount?.address;

  const fetchTransferToken = useCallback(async () => {
    const keyPair = managementAccount?.wallet.keyPair as ec.KeyPair;
    const plainTextOrigin = `Nonce:${Date.now()}`;
    const plainTextHex = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    const plainTextHexSignature = Buffer.from(plainTextHex).toString('hex');

    const signature = AElf.wallet.sign(plainTextHexSignature, keyPair).toString('hex');
    const pubkey = keyPair.getPublic('hex');

    const params = {
      pubkey: pubkey,
      signature: signature,
      plain_text: plainTextHex,
      ca_hash: caHash ?? '',
      chain_id: originChainId ?? 'AELF',
      managerAddress: address,
    };

    const serializedParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      serializedParams.append(key, value);
    }

    const customFetch = new FetchRequest({
      url: '/api/app/transfer/connect/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });

    const { access_token, token_type } = await customFetch.send({
      body: serializedParams.toString(),
    });

    return `${token_type} ${access_token}`;
  }, [managementAccount?.wallet.keyPair, caHash, originChainId, address]);

  const fetchDepositInfo = useCallback(
    async (fetchToken: string) => {
      if (!toChainId || !fromNetwork || !fromSymbol || !toSymbol) {
        throw new Error('Invalid params: toChainId, fromNetwork, fromToken, toToken');
      }
      const params = {
        chainId: toChainId,
        network: fromNetwork,
        symbol: fromSymbol,
        toSymbol: toSymbol,
      };

      const { data } = await did.services.receive.getDepositInfo(params, {
        'T-Authorization': fetchToken,
      });

      return data?.depositInfo;
    },
    [fromNetwork, fromSymbol, toChainId, toSymbol],
  );

  useEffect(() => {
    (async () => {
      try {
        if (receiveType === ReceiveType.ETransfer) {
          setLoading(true);
          setDepositInfo(undefined);
          const fetchToken = await fetchTransferToken();
          const info = await fetchDepositInfo(fetchToken);
          setDepositInfo(info);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchDepositInfo, fetchTransferToken, receiveType]);

  return { loading, depositInfo };
};
