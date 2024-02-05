import { SendOptions, SendResult, ViewResult, CallOptions } from '@portkey/types';
import { ContractProps, IPortkeyContract } from './types';
import { BaseContract } from './baseContract';
import { Web3Contract } from './web3Contract';
import { AElfContract } from './aelfContract';

export class ContractBasic extends BaseContract implements IPortkeyContract {
  public callContract: IPortkeyContract;
  constructor(options: ContractProps) {
    super(options);
    this.callContract = this.type === 'aelf' ? new AElfContract(options) : new Web3Contract(options);
  }
  public callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    return this.callContract.callViewMethod(functionName, paramsOption, callOptions);
  }

  public callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    return this.callContract.callSendMethod(functionName, account, paramsOption, sendOptions);
  }

  public encodedTx<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    return this.callContract.encodedTx(functionName, paramsOption, callOptions);
  }
}
