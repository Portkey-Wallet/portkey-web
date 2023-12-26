import { VerifierItem } from '@portkey-v1/did';
import { ChainId } from '@portkey-v1/types';
import { ChainType } from '@portkey-v1/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { isExtension } from '..';
import { PortkeyUIError } from '../../constants/error';
import { did } from '../did';

interface VerifierListParams {
  sandboxId?: string;
  rpcUrl?: string;
  address?: string;
  chainType: ChainType;
  chainId: ChainId;
}

export const getVerifierListOnExtension = async ({
  sandboxId,
  rpcUrl,
  chainType,
  address, // contract address
}: Omit<VerifierListParams, 'contract'>): Promise<VerifierItem[]> => {
  if (!rpcUrl) throw Error('Missing rpcUrl');
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callViewMethod,
    {
      rpcUrl,
      chainType,
      address,
      methodName: 'GetVerifierServers',
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw Error(resMessage.error.message);
  const verifierList = resMessage.message?.verifierServers;
  return verifierList;
};

export const getVerifierListOthers = (params: Omit<VerifierListParams, 'sandboxId'>) => {
  if (!did.getVerifierServers) throw Error(PortkeyUIError.noDid);
  return did.getVerifierServers(params.chainId);
};

export const getVerifierList = (params: VerifierListParams) => {
  const extension = isExtension();
  const { sandboxId } = params;
  if (extension) {
    if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return getVerifierListOnExtension(params);
  }
  return getVerifierListOthers(params);
};
