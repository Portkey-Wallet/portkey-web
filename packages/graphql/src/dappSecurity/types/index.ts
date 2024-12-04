import { ApolloQueryResult } from '@apollo/client';

export * from './common';

export type TCommonGraphQLResult<T> = Promise<ApolloQueryResult<T>>;

export type TGetContractUpgradeTimeParams = {
  input: {
    chainId: string;
    address: string;
    skipCount: number;
    maxResultCount: number;
  };
};
export type TGetContractUpgradeTimeResult = {
  contractList: {
    items: IContractInfoDto[];
  };
};
export type IContractInfoDto = {
  metadata: IMetadataDto;
};
export type IMetadataDto = {
  block: IBlockMetadataDto;
};
export type IBlockMetadataDto = {
  blockTime: string;
};
