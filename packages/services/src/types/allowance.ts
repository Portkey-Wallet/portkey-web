import { ChainId } from '@portkey/types';
import { CaAddressInfosType } from './assets';

export interface IAllowanceService {
  getAllowanceList: (params: GetAllowanceParams) => Promise<GetAllowanceResult>;
  checkSpenderValid: (params: ICheckSpenderValidParams) => Promise<boolean>;
}

export interface ISymbolApprovedItem {
  symbol: string;
  amount: number;
  decimals: number;
  imageUrl?: string;
  updateTime?: string;
}

export interface AllowanceItem {
  chainId: ChainId;
  contractAddress: string;
  url?: string;
  icon?: string;
  name?: string;
  symbolApproveList?: ISymbolApprovedItem[];
  chainImageUrl?: string;
}

export interface GetAllowanceParams {
  maxResultCount: number;
  skipCount: number;
  caAddressInfos: CaAddressInfosType;
}
export interface ICheckSpenderValidParams {
  website: string;
  logo: string;
  spender: string;
}

export interface GetAllowanceResult {
  data: Array<AllowanceItem>;
  totalRecordCount: number;
}
