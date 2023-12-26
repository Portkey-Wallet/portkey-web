import { CallOptions, SendOptions, SendResult, ViewResult } from '@portkey-v1/types';
import { getContractBasic } from '@portkey-v1/contracts';
import { ICustomEncodeTxOptions, ICustomSendOptions, ICustomViewOptions } from './types';

const handlerResult = (result: any) => {
  if (result.error) throw result.error;
  return result;
};

export class ContractByWeb {
  static async callSendMethod<P = any, R = any>(
    contractOptions: ICustomSendOptions['contractOptions'],
    functionName: string,
    account: string,
    paramsOption?: P,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<R>> {
    const contract = await getContractBasic(contractOptions as any);
    const result = await contract.callSendMethod(functionName, account, paramsOption, sendOptions);
    return handlerResult(result);
  }

  static async callViewMethod<P = any, R = any>(
    contractOptions: ICustomViewOptions['contractOptions'],
    functionName: string,
    paramsOption?: P,
    callOptions?: CallOptions,
  ): Promise<ViewResult<R>> {
    const contract = await getContractBasic(contractOptions as any);
    const result = await contract.callViewMethod(functionName, paramsOption, callOptions);
    return handlerResult(result);
  }

  static async encodedTx<P = any, R = any>(
    contractOptions: ICustomEncodeTxOptions['contractOptions'],
    functionName: string,
    paramsOption?: P,
  ): Promise<ViewResult<R>> {
    const contract = await getContractBasic(contractOptions as any);
    if ('chainProvider' in contractOptions) throw 'Not support';
    const result = await contract.encodedTx(functionName, paramsOption);
    return handlerResult(result);
  }
}
