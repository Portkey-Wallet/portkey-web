import {
  CallOptions,
  ChainId,
  ChainType,
  IAElfRPCMethods,
  IBlockchainWallet,
  IContract,
  ViewResult,
} from '@portkey/types';
import { IChain } from '@portkey/provider-types';

export interface IPortkeyContract extends IContract {
  encodedTx<T = any>(functionName: string, paramsOption?: any, callOptions?: CallOptions): Promise<ViewResult<T>>;
}

export interface BaseContractOptions {
  chainId?: ChainId;
  contractAddress: string;
  type: ChainType;
  rpcUrl: string;
}

export interface ContractProps extends BaseContractOptions {
  aelfContract?: any;
  aelfInstance?: { chain: IAElfRPCMethods };
}

export interface CAContractProps extends ContractProps {
  caContractAddress: string;
  caContract: any;
  caHash: string;
}

export type CallType = 'ca' | 'eoa';

export interface IBaseOptions {
  contractAddress: string;
  callType?: CallType;
  chainType?: ChainType;
}

export interface IProviderOptions extends IBaseOptions {
  chainProvider: IChain;
}

export interface IEOAInstanceOptions extends IBaseOptions {
  rpcUrl?: string;
  aelfInstance?: { chain: IAElfRPCMethods };
  account: { address: string } | IBlockchainWallet;
}

export interface ICAInstanceOptions extends IEOAInstanceOptions {
  callType: 'ca';
  caHash: string;
  caContractAddress: string;
}

export interface IGetContract {
  /**
   * use base contract
   * @returns IPortkeyContract
   */
  getContractBasic(options: IEOAInstanceOptions): Promise<IPortkeyContract>;

  /**
   * use ca contract
   * @returns IContract
   */
  getContractBasic(options: ICAInstanceOptions): Promise<IPortkeyContract>;

  /**
   * use provider contract
   * @returns IContract
   */
  getContractBasic(options: IProviderOptions): Promise<IContract>;
}
