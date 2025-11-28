import { ChainType } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';

export const handleGuardian = async ({
  sandboxId,
  rpcUrl,
  chainType,
  address, // contract address
  privateKey,
  paramsOption,
}: {
  sandboxId: string;
  rpcUrl: string;
  address: string;
  chainType: ChainType;
  privateKey: string;
  paramsOption: { method: string; params: any[] };
}) => {
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callSendMethod,
    {
      rpcUrl: rpcUrl,
      address,
      privateKey,
      chainType,
      methodName: paramsOption.method,
      paramsOption: paramsOption.params,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw Error(resMessage.error.message);
  const message = resMessage.message;
  return {
    code: resMessage.code,
    result: {
      rpcUrl,
      message,
    },
  };
};
