import { ChainId } from '@portkey/types';
import { CustomContractBasic, did } from '..';
import { getChainInfo } from '../../hooks/useChainInfo';
import { GuardianApprovedItem } from '../../components/Guardian/utils/type';

export const setTransferLimit = async ({
  params,
  targetChainId,
  sandboxId = '',
  caHash,
}: {
  params: { guardiansApproved: GuardianApprovedItem[]; symbol: string; singleLimit: string; dailyLimit: string };
  targetChainId?: ChainId;
  sandboxId?: string;
  caHash: string;
}) => {
  if (!targetChainId) throw Error('No chainId');

  const chainInfo = await getChainInfo(targetChainId);
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
