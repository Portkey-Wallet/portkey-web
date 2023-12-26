import { CallOptions, ChainId, SendOptions, SendResult, ViewResult } from '@portkey-v1/types';

import { IPortkeyContract } from './types';
import { BaseContract } from './baseContract';

export class Web3Contract extends BaseContract implements IPortkeyContract {
  chainId?: ChainId;

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
