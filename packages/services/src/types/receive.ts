import { ChainId } from '@portkey/types';

export type GetReceiveNetworkListParams = {
  symbol: string;
};

export type GetDepositInfoParams = {
  chainId: string;
  network: string;
  symbol: string;
  toSymbol: string;
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

export type TReceiveDepositInfoResponse = {
  code: string;
  message?: string;
  data: {
    depositInfo: TDepositInfo;
  };
};

export interface FetchTransferTokenParams {
  pubkey: string;
  signature: string;
  plain_text: string;
  ca_hash: string;
  chain_id: string;
  managerAddress: string;
}

export interface FetchTransferTokenResponse {
  access_token: string;
  token_type: string;
}

export type IReceiveService = {
  getReceiveNetworkList(params: GetReceiveNetworkListParams): Promise<TReceiveNetworkListResponse>;

  fetchTransferToken(params: FetchTransferTokenParams): Promise<FetchTransferTokenResponse>;

  getDepositInfo(params: GetDepositInfoParams, headers: Record<string, string>): Promise<TReceiveDepositInfoResponse>;
};

export type TDepositInfo = {
  depositAddress: string;
  minAmount: string;
  extraNotes?: string[];
  minAmountUsd: string;
  extraInfo?: TDepositExtraInfo;
  serviceFee?: string;
  serviceFeeUsd?: string;
  currentThreshold?: string;
};

export type TDepositExtraInfo = {
  slippage: string;
};
