import { ICAInstanceOptions, IEOAInstanceOptions, IProviderOptions } from '@portkey/contracts';
import { CallOptions, ChainType, SendOptions } from '@portkey/types';

export interface BaseSendOption {
  rpcUrl: string;
  address: string;
  chainType: ChainType;
  privateKey: string;
  sendOptions?: SendOptions;
}

export type IWalletContractOptions = Omit<IEOAInstanceOptions, 'account'> | Omit<ICAInstanceOptions, 'account'>;

export interface IBaseCustomSendOptions<T = any> {
  functionName: string;
  paramsOption?: T;
  sendOptions?: SendOptions | undefined;
  sandboxId?: string;
}
export interface IWalletCustomSendOptions<T = any> extends IBaseCustomSendOptions<T> {
  contractOptions: IWalletContractOptions;
  privateKey: string;
}

export type ICustomSendOptions<T = any> = IWalletCustomSendOptions<T>;

export interface ICustomViewOptions<T = any> {
  contractOptions: IWalletContractOptions;
  functionName: string;
  paramsOption?: T;
  callOptions?: CallOptions;
  sandboxId?: string;
}

export type ICustomEncodeTxOptions<T = any> = Omit<IWalletCustomSendOptions<T>, 'sendOptions'>;
