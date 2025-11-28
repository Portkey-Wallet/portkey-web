import {
  CaHolderManagerInfoDocument,
  CaHolderManagerInfoQuery,
  CaHolderManagerInfoQueryVariables,
} from './__generated__/hooks/caHolderManagerInfo';
import {
  LoginGuardianInfoDocument,
  LoginGuardianInfoQuery,
  LoginGuardianInfoQueryVariables,
} from './__generated__/hooks/loginGuardianInfo';
import { IGraphQLClient } from '../types';

// CAHolderManager
const getCAHolderManagerInfo = async (apolloClient: IGraphQLClient, params: CaHolderManagerInfoQueryVariables) => {
  const result = await apolloClient.query<CaHolderManagerInfoQuery>({
    query: CaHolderManagerInfoDocument,
    variables: params,
  });
  return result;
};

// LoginGuardianType
const getLoginGuardianAccount = async (apolloClient: IGraphQLClient, params: LoginGuardianInfoQueryVariables) => {
  const result = await apolloClient.query<LoginGuardianInfoQuery>({
    query: LoginGuardianInfoDocument,
    variables: params,
  });
  return result;
};

export { getCAHolderManagerInfo, getLoginGuardianAccount };
