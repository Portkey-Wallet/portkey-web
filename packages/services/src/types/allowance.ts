import { ChainId } from '@portkey/types';
import { CaAddressInfosType } from './assets';

export interface IAllowanceService {
  getAllowanceList: (params: GetAllowanceParams) => Promise<GetAllowanceResult>;
}

export interface AllowanceItem {
  chainId: ChainId;
  contractAddress: string;
  url?: string;
  icon?: string;
  name?: string;
  allowance: number;
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
