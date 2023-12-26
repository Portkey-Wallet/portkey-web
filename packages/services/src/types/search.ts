import { ChainId } from '@portkey-v1/types';

export interface RegisterStatusResult extends ICAInfo {
  registerStatus: Status;
  registerMessage: string;
}
export interface RecoverStatusResult extends ICAInfo {
  recoveryStatus: Status;
  recoveryMessage: string;
}

export interface ICAInfo {
  caAddress: string;
  caHash: string;
}

export type Status = 'pass' | 'fail' | 'pending';

export type ChainInfo = {
  chainId: ChainId;
  chainName: string;
  endPoint: string;
  explorerUrl: string;
  caContractAddress: string;
  lastModifyTime: string;
  id: string;
  defaultToken: {
    name: string;
    address: string;
    imageUrl: string;
    symbol: string;
    decimals: string;
  };
};

export type QueryOptions = {
  interval: number;
  reCount: number;
  maxCount: number;
};

export interface ISearchService {
  getRegisterStatus(id: string, queryOptions?: QueryOptions): Promise<RegisterStatusResult>;
  getRecoverStatus(id: string, queryOptions?: QueryOptions): Promise<RecoverStatusResult>;
  getChainsInfo(): Promise<ChainInfo[]>;
  getCAHolderInfo(Authorization: string, caHash: string): Promise<CAHolderInfo>;
}

export type CAHolderInfo = {
  userId: string;
  caAddress: string;
  caHash: string;
  id: string;
  nickName: string;
};
