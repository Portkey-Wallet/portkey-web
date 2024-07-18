import { ChainId } from '@portkey/types';
import { CaAddressInfosType } from './assets';

export interface IAllowanceService {
  getAllowanceList: (params: GetAllowanceParams) => Promise<GetAllowanceResult>;
}

export interface ISymbolApprovedItem {
  symbol: string;
  amount: number;
  decimals: number;
}

export interface AllowanceItem {
  chainId: ChainId;
  contractAddress: string;
  url?: string;
  icon?: string;
  name?: string;
  symbolApproveList?: ISymbolApprovedItem[];
}

export interface GetAllowanceParams {
  maxResultCount: number;
  skipCount: number;
  caAddressInfos: CaAddressInfosType;
}

export interface GetAllowanceResult {
  data: Array<AllowanceItem>;
  totalRecordCount: number;
}
