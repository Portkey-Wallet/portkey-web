import { useCallback } from 'react';
import {
  BRIDGE_TOKEN_WHITE_LIST_MAINNET,
  BRIDGE_TOKEN_WHITE_LIST_TESTNET,
  BRIDGE_INFO_AELF_MAINNET,
  BRIDGE_INFO_AELF_TESTNET,
  BRIDGE_INFO_EVM_MAINNET,
  BRIDGE_INFO_EVM_TESTNET,
} from '../constants/eBridge';
import { IEBridgeChainInfo } from '../utils/eBridge/types';
import { ChainId } from '@portkey/types';
import { usePortkey } from '../components/context';
import { useCurrentChainList } from './useChainInfo';

export default function useGetEBridgeConfig() {
  const [{ networkType }] = usePortkey();
  const { chainList: currentChainList } = useCurrentChainList();

  const getTokenConfig = useCallback(
    (symbol: string) => {
      return networkType === 'MAINNET'
        ? BRIDGE_TOKEN_WHITE_LIST_MAINNET[symbol]
        : BRIDGE_TOKEN_WHITE_LIST_TESTNET[symbol];
    },
    [networkType],
  );

  const getAELFChainInfoConfig = useCallback(
    (chainId: ChainId | string): IEBridgeChainInfo => {
      const targetItem = currentChainList?.find((ele) => ele.chainId === chainId);
      return {
        chainType: 'aelf',
        chainId,
        rpcUrl: targetItem?.endPoint || '',
        bridgeContract: (networkType === 'MAINNET'
          ? BRIDGE_INFO_AELF_MAINNET[chainId].BRIDGE_CONTRACT
          : BRIDGE_INFO_AELF_TESTNET[chainId].BRIDGE_CONTRACT) as string,
      };
    },
    [currentChainList, networkType],
  );

  const getEVMChainInfoConfig = useCallback(
    (network: string): IEBridgeChainInfo => {
      const _network = network.toUpperCase();
      const targetEvmInfo = (networkType === 'MAINNET' ? BRIDGE_INFO_EVM_MAINNET : BRIDGE_INFO_EVM_TESTNET)[_network];

      return {
        chainType: 'evm',
        ...targetEvmInfo.chainInfo,
        limitContract: targetEvmInfo.limitContractAddress,
        bridgeContract: targetEvmInfo.bridgeContractAddress,
      };
    },
    [networkType],
  );

  return { getTokenConfig, getAELFChainInfoConfig, getEVMChainInfoConfig };
}
