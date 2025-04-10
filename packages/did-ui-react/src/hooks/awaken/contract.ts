import { useSwapHookContractAddress } from '.';
import { CommonContractBasic } from '../../utils/sandboxUtil/CommonContractBasic';
import AElf from 'aelf-sdk';
import { getChain, useDAppChainId } from '../useChainInfo';
import { useCallback } from 'react';
import { usePortkey } from '../../components/context';
const Wallet = AElf.wallet;

export const useGetSwapHookViewContract = () => {
  const contractAddress = useSwapHookContractAddress();
  const dAppChainId = useDAppChainId();
  const [{ sandboxId }] = usePortkey();

  return useCallback(async () => {
    const chainInfo = await getChain(dAppChainId);

    const wallet = Wallet.createNewWallet();

    return new CommonContractBasic({
      rpcUrl: chainInfo.endPoint,
      contractAddress,
      privateKey: wallet.privateKey,
      sandboxId,
    });
  }, [contractAddress, dAppChainId, sandboxId]);
};
