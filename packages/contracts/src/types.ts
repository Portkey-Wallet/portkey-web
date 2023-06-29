import { ChainId, ChainType, IAElfRPCMethods } from '@portkey/types';

export type SendOptions = {
  from?: string;
  gasPrice?: string;
  gas?: number;
  value?: number | string;
  nonce?: number;
  onMethod: 'transactionHash' | 'receipt' | 'confirmation';
};

export interface ErrorMsg {
  name?: string;
  code?: number;
  message?: string;
}
export interface ViewResult<T = any> {
  data?: T;
  error?: ErrorMsg;
}

export interface SendResult<T = any> extends ViewResult<T> {
  transactionId?: string;
}

export type ContractBasicErrorMsg = ErrorMsg;

export type CallOptions = {
  defaultBlock: number | string;
  options?: any;
  callback?: any;
};
export interface IContract {
  address?: string;
  chainId?: ChainId;
  type: ChainType;
  callViewMethod<T = any>(functionName: string, paramsOption?: any, callOptions?: CallOptions): Promise<ViewResult<T>>;
  callSendMethod<T = any>(
    functionName: string,
    account: string,
    paramsOption?: any,
    sendOptions?: SendOptions,
  ): Promise<SendResult<T>>;
}

export interface IPortkeyContract extends IContract {
  encodedTx<T = any>(functionName: string, paramsOption?: any): Promise<ViewResult<T>>;
}

export interface BaseContractOptions {
  chainId?: ChainId;
  contractAddress: string;
  type: ChainType;
  rpcUrl: string;
}

export interface ContractProps extends BaseContractOptions {
  aelfContract?: any;
  aelfInstance?: IAElfRPCMethods;
}
