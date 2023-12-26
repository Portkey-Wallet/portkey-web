import { ChainType } from '@portkey-v1/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';

export const removeManager = async ({
  rpcUrl,
  sandboxId,
  chainType,
  address, // contract address
  privateKey,
  paramsOption,
}: {
  rpcUrl: string;
  sandboxId: string;
  address: string;
  chainType: ChainType;
  privateKey: string;
  paramsOption: { caHash: string; manager: { managerAddress: string; deviceString: string } };
}) => {
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callSendMethod,
    {
      rpcUrl: rpcUrl,
      address,
      privateKey,
      chainType,
      methodName: 'RemoveManager',
      paramsOption: [paramsOption],
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
