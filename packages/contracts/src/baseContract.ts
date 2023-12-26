import { ChainId, ChainType } from '@portkey-v1/types';
import { BaseContractOptions } from './types';

export abstract class BaseContract {
  public address: string;
  public chainId?: ChainId;
  public type: ChainType;
  public rpcUrl: string;
  constructor(options: BaseContractOptions) {
    Object.assign(this, options);
    this.rpcUrl = options.rpcUrl;
    this.chainId = options.chainId;
    this.type = options.type;
    this.address = options.contractAddress;
  }
}
