import { ChainId } from '@portkey/types';

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
  caContractAddress: string;
  chainId: ChainId;
  chainImageUrl: string;
  chainName: string;
  defaultToken: {
    address: string;
    decimals: string;
    imageUrl: string;
    issueChainId: number;
    name: string;
    symbol: string;
  };
  displayChainName: string;
  endPoint: string;
  explorerUrl: string;
  lastModifyTime: string;
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
