import { ChainId } from '@portkey/provider-types';
import { getChain } from './chainInfo';
import { getContract, getManager } from './wallet';

export interface IClearManagerReadOnly {
  caHash: string;
  guardiansApproved: any[];
  chainId: ChainId;
}

export const clearManagerReadOnly = async ({ chainId, caHash, guardiansApproved }: IClearManagerReadOnly) => {
  const chainInfo = await getChain(chainId);
  const manager = await getManager();
  const caContract = await getContract({
    manager,
    rpcUrl: chainInfo.endPoint,
    contractAddress: chainInfo.caContractAddress,
  });
  const res = await caContract?.callSendMethod('RemoveReadOnlyManager', '', {
    caHash,
    guardiansApproved,
  });
  console.log('clearManagerReadOnly contract res', res);
  return res?.data?.Status === 'MINED';
};
