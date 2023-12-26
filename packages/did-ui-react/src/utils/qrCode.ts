import { ChainId, ChainType } from '@portkey-v1/types';
import { NetworkType } from '../types';

export type QrCodeDataArrType = [
  ChainType,
  NetworkType,
  'login' | 'send',
  string,
  string,
  string,
  ChainId,
  string | number,
  number | undefined,
];

export type QRCodeDataObjType = {
  address: string;
  netWorkType: NetworkType;
  chainType: ChainType;
  type: 'login' | 'send';
  toInfo: { name: string; address: string };
  deviceType?: number;
  assetInfo: {
    symbol: string;
    tokenContractAddress: string;
    chainId: ChainId;
    decimals: string | number;
  };
};

export const shrinkSendQrData = (data: QRCodeDataObjType): QrCodeDataArrType => {
  // 1.chainType  2.netWorkType 3.data.type 4.toAddress 5. symbol 6. tokenContractAddress 7. chainId 8. decimals
  return [
    data.chainType,
    data.netWorkType,
    data.type,
    data.address,
    data.assetInfo.symbol,
    data.assetInfo.tokenContractAddress,
    data.assetInfo.chainId,
    data.assetInfo.decimals,
    data.deviceType,
  ];
};
