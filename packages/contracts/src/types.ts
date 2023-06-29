import { ChainId, ChainType, IAElfRPCMethods, IContract, ViewResult } from '@portkey/types';

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
