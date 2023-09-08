import { ChainId } from '@portkey/types';
import { CustomContractBasic, did } from '..';
import { getChainInfo } from '../../hooks/useChainInfo';
import { IGuardianItem } from '../../types';

export enum GuardianMth {
  addGuardian = 'AddGuardian',
  UpdateGuardian = 'UpdateGuardian',
  RemoveGuardian = 'RemoveGuardian',
  SetGuardianTypeForLogin = 'SetGuardianForLogin',
  UnsetGuardianTypeForLogin = 'UnsetGuardianForLogin',
}
export const handleGuardianContract = async ({
  type,
  params,
  chainId,
  sandboxId = '',
  caHash,
}: {
  type: GuardianMth;
  params: { guardiansApproved: IGuardianItem[]; symbol: string; singleLimit: number; dailyLimit: number };
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
    functionName: type,
    paramsOption: {
      caHash,
      ...params,
    },
  });
  console.log('===setTransferLimit result', res);
};
