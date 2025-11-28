import { SendResult, ViewResult } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { ICustomEncodeTxOptions, ICustomSendOptions, ICustomViewOptions } from './types';

const handleSandboxResult = (resMessage: any) => {
  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  const result = resMessage.message;
  if (result.message?.error) throw result.message?.error;
  return result;
};

export class ContractBySandbox {
  static async callSendMethod<P = any, R = any>({
    sandboxId,
    ...params
  }: ICustomSendOptions<P>): Promise<SendResult<R>> {
    const resMessage = await SandboxEventService.dispatchAndReceive(
      SandboxEventTypes.callSendMethodFormat,
      params as any,
      sandboxId,
    );
    return handleSandboxResult(resMessage);
  }

  static async callViewMethod<P = any, R = any>({
    sandboxId,
    ...params
  }: ICustomViewOptions<P>): Promise<ViewResult<R>> {
    const resMessage = await SandboxEventService.dispatchAndReceive(
      SandboxEventTypes.callViewMethodFormat,
      params as any,
      sandboxId,
    );
    return handleSandboxResult(resMessage);
  }

  static async encodedTx<P = any, R = any>({
    sandboxId,
    ...params
  }: ICustomEncodeTxOptions<P>): Promise<ViewResult<R>> {
    const resMessage = await SandboxEventService.dispatchAndReceive(
      SandboxEventTypes.encodedTx,
      params as any,
      sandboxId,
    );
    return handleSandboxResult(resMessage);
  }
}
