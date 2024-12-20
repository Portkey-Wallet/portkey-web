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

export type ISendService = {
  getSendNetworkList(params: GetSendNetworkListParamsType): Promise<SendNetworkListResponseType>;
};
