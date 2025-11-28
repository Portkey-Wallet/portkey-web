import { useCallback } from 'react';
import AElf from 'aelf-sdk';
import { getChain } from './useChainInfo';
import { ChainId } from '@portkey/types';
import { CommonContractBasic } from '../utils/sandboxUtil/CommonContractBasic';
import { usePortkey } from '../components/context';
import { usePortkeyAsset } from '../components';

const Wallet = AElf.wallet;

export const useGetTokenViewContract = () => {
  const [{ sandboxId }] = usePortkey();

  return useCallback(
    async (chainId: ChainId) => {
      const chainInfo = await getChain(chainId);

      const wallet = Wallet.createNewWallet();

      const contract = new CommonContractBasic({
        rpcUrl: chainInfo.endPoint,
        contractAddress: chainInfo.defaultToken.address,
        privateKey: wallet.privateKey,
        sandboxId: sandboxId,
      });
      return contract;
    },
    [sandboxId],
  );
};

export const useGetCAContract = () => {
  const [{ sandboxId }] = usePortkey();
  const [{ managementAccount }] = usePortkeyAsset();

  return useCallback(
    async (chainId: ChainId) => {
      const chainInfo = await getChain(chainId);

      const contract = new CommonContractBasic({
        rpcUrl: chainInfo.endPoint,
        contractAddress: chainInfo.caContractAddress,
        privateKey: managementAccount?.privateKey,
        sandboxId: sandboxId,
      });
      return contract;
    },
    [managementAccount?.privateKey, sandboxId],
  );
};
