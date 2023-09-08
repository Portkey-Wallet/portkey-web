import { ChainId } from '@portkey/types';
import { CustomContractBasic, did } from '..';
import { getChainInfo } from '../../hooks/useChainInfo';
import { GuardianItem } from '../../components/Guardian/utils/type';

export const setTransferLimit = async ({
  params,
  chainId,
  sandboxId = '',
  caHash,
}: {
  params: { guardiansApproved: GuardianItem[]; symbol: string; singleLimit: number; dailyLimit: number };
  chainId: ChainId;
  sandboxId?: string;
  caHash: string;
}) => {
  const chainInfo = await getChainInfo(chainId);
  const res = await CustomContractBasic.callSendMethod({
    sandboxId,
    privateKey: did?.didWallet?.managementAccount?.privateKey || '',
    contractOptions: {
      rpcUrl: chainInfo?.endPoint,
      contractAddress: chainInfo?.caContractAddress || '',
    },
    functionName: 'SetTransferLimit',
    paramsOption: {
      caHash,
      ...params,
    },
  });
  console.log('===setTransferLimit result', res);
};
