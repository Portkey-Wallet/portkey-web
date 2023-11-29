import { ChainId } from '@portkey/types';
import { getChainInfo } from '../../hooks/useChainInfo';
import { CustomContractBasic, did } from '..';

export enum GuardianMth {
  addGuardian = 'AddGuardian',
  UpdateGuardian = 'UpdateGuardian',
  RemoveGuardian = 'RemoveGuardian',
  SetGuardianTypeForLogin = 'SetGuardianForLogin',
  UnsetGuardianTypeForLogin = 'UnsetGuardianForLogin',
}
export const handleGuardianByContract = async ({
  type,
  params,
  chainId,
  sandboxId = '',
  caHash,
}: {
  type: GuardianMth;
  params: any;
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
  console.log('===handleAddGuardian res', res);
};
