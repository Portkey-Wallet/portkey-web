import { TGetWithdrawInfoResult, TCreateWithdrawOrderResult } from '@etransfer/types';
import { ChainId } from '@portkey/types';
import { IStorageSuite } from '@portkey/types';
import { ContractBasic } from '@portkey/contracts';
ContractBasic;
export interface ICrossTransferInitOption {
  walletInfo: any; // TODO:change it
  eTransferUrl: string;
  pin: string;
  chainList: any[]; // TODO: change it
  eTransferCA: {
    [x in ChainId]?: string;
  };
  storage?: IStorageSuite;
}

export interface IWithdrawPreviewParams {
  chainId: ChainId;
  address: string;
  symbol: string;
  network: string;
  amount?: string;
}

export interface IWithdrawParams {
  chainId: ChainId;
  tokenContract: ContractBasic;
  portkeyContract: ContractBasic;
  toAddress: string;
  network: string;
  amount: string;
  tokenInfo: {
    address: string;
    symbol: string;
    decimals: number;
  };
  isCheckSymbol?: boolean;
}

export interface ICrossTransfer {
  init(options: ICrossTransferInitOption): void;
  withdrawPreview(params: IWithdrawPreviewParams): Promise<TGetWithdrawInfoResult>;
  withdraw(params: IWithdrawParams): Promise<TCreateWithdrawOrderResult>;
}
