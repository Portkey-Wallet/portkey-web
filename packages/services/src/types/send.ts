import { ChainId } from '@portkey/types';

export type GetSendNetworkListParamsType = {
  symbol: string;
  chainId: ChainId;
  toAddress: string;
};

export type SendDataType = {
  networkList: any;
};

export type SendNetworkListResponseType = {
  code: string;
  message?: string;
  data: SendDataType;
};

export interface ITransferSupportNetworkItem {
  network: 'aelf' | string;
  name: string;
}

export type TSupportConfigMap = {
  [K in ChainId]: {
    [symbol: string]: ITransferSupportNetworkItem[];
  };
};

export type SupportedNetworkConfigResponseType = {
  code: string;
  message?: string;
  data: TSupportConfigMap;
};

export type ISendService = {
  getSendNetworkList(params: GetSendNetworkListParamsType): Promise<SendNetworkListResponseType>;
  getSupportedTransferConfig(): Promise<{ supportedNetworks: TSupportConfigMap }>;
};
