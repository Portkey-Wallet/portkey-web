import { ChainId, ChainType } from '@portkey/types';
import { CallOptions, IPortkeyContract, SendOptions, SendResult, ViewResult } from './types';

export class Web3Contract implements IPortkeyContract {
  address?: string;
  chainId?: ChainId;
  type: ChainType;

  encodedTx<T = any>(_functionName: string, _paramsOption?: any): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }

  callViewMethod<T = any>(
    _functionName: string,
    _paramsOption?: any,
    _callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    throw new Error('Method not implemented.');
  }

  callSendMethod<T = any>(
    _functionName: string,
    _account: string,
    _paramsOption?: any,
    _sendOptions?: SendOptions,
  ): Promise<SendResult<T>> {
    throw new Error('Method not implemented.');
  }
}
