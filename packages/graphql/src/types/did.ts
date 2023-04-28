import { CaHolderManagerDto, GetCaHolderManagerInfoDto, LoginGuardianDto } from '../did/__generated__/types';

//getHolderInfoByManager
export type GetCAHolderByManagerParamsType = Required<Pick<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>>;

export type CaHolderWithGuardian = CaHolderManagerDto & {
  loginGuardianInfo: Array<LoginGuardianDto | null>;
};

export interface IDIDGraphQL {
  getHolderInfoByManager(params: GetCAHolderByManagerParamsType): Promise<{
    caHolderManagerInfo: CaHolderWithGuardian[];
  }>;
}
