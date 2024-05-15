import { CaHolderManagerDto, GetCaHolderManagerInfoDto, LoginGuardianDto } from '../did/__generated__/types';

//getHolderInfoByManager
export type GetCAHolderByManagerParamsType = Partial<Omit<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>> &
  Required<Pick<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>>;

export type CaHolderWithGuardian = CaHolderManagerDto & {
  loginGuardianInfo: Array<LoginGuardianDto | null>;
};

export interface IDIDGraphQL {
  getHolderInfoByManager(params: GetCAHolderByManagerParamsType): Promise<{
    caHolderManagerInfo: CaHolderWithGuardian[];
  }>;
}
