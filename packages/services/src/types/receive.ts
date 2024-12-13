import { ChainId } from '@portkey/types';

export type GetReceiveNetworkListParams = {
  symbol: string;
};

export enum ReceiveFromNetworkServiceType {
  ETransfer = 'ETransfer',
  EBridge = 'EBridge',
}

export enum ReceiveType {
  Portkey = 'Portkey',
  ETransfer = 'ETransfer',
  EBridge = 'EBridge',
}

export type TReceiveFromNetworkServiceItem = {
  serviceName: ReceiveFromNetworkServiceType;
  multiConfirmTime: string;
  maxAmount: string;
};

export type TReceiveFromNetworkItem = {
  network: string;
  name: string;
  imageUrl: string;
  serviceList: TReceiveFromNetworkServiceItem[];
};

export type TReceiveTokenMap = {
  [key in ChainId]: TReceiveFromNetworkItem[];
};

export type TReceiveData = {
  destinationMap: TReceiveTokenMap;
};

export type TReceiveNetworkListResponse = {
  code: string;
  message?: string;
  data: TReceiveData;
};

export type IReceiveService = {
  getReceiveNetworkList(params: GetReceiveNetworkListParams): Promise<TReceiveNetworkListResponse>;
};
