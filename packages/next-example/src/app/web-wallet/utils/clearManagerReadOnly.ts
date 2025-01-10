import { ChainId } from '@portkey/provider-types';
import { getChain } from './chainInfo';
import { getContract, getManager } from './wallet';
import { did } from '@portkey/did-ui-react';
import { GuardiansApproved } from '@portkey/services';

export interface IClearManagerReadOnly {
  caHash: string;
  guardiansApproved: GuardiansApproved[];
  chainId: ChainId;
  pin: string;
}

export const clearManagerReadOnly = async ({ chainId, caHash, guardiansApproved, pin }: IClearManagerReadOnly) => {
  const chainInfo = await getChain(chainId);
  const manager = await getManager(did, pin);
  const caContract = await getContract({
    manager,
    rpcUrl: chainInfo.explorerUrl,
    contractAddress: chainInfo.caContractAddress,
  });
  const res = caContract?.callSendMethod(
    'RemoveReadOnlyManager',
    '',
    {
      caHash,
      guardiansApproved,
    },
    { onMethod: 'transactionHash' },
  );
  console.log('clearManagerReadOnly res', res);
  return true;
};
