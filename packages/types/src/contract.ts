import { ChainType, ChainId } from './chain';

export interface ErrorMsg {
  name?: string;
  code?: number;
  message?: string;
}

export type SendOptions = {
  from?: string;
  gasPrice?: string;
  gas?: number;
  value?: number | string;
  nonce?: number;
  /**
   * transactionHash: The transaction is committed without confirmation
   * receipt: The transaction has been confirmed and returns receipt
   */
  onMethod?: 'transactionHash' | 'receipt' | 'confirmation';

  // append params;
  appendParams?: any;
};

export type CallOptions = {
  defaultBlock?: number | string;
  options?: any;
  callback?: any;

  // append params;
  appendParams?: any;
};
export interface ViewResult<T = any> {
  data?: T;
  error?: ErrorMsg;
}

export interface SendResult<T = any> extends ViewResult<T> {
  transactionId?: string;
}
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

export type ICallViewMethod = (
  functionName: string,
  paramsOption?: any,
  callOptions?: {
    defaultBlock: number | string;
    options?: any;
    callback?: any;
  },
) => Promise<ViewResult>;

export type ICallSendMethod = (
  functionName: string,
  account: string,
  paramsOption?: any,
  sendOptions?: SendOptions,
) => Promise<SendResult>;
