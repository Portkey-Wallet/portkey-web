import { ChainType, SendOptions } from '@portkey/types';

export interface BaseSendOption {
  rpcUrl: string;
  address: string;
  chainType: ChainType;
  privateKey: string;
  sendOptions?: SendOptions;
}
