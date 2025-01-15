import { getLimitOrderRemainingUnfilled, getPairReserve } from '../request';
import { getGraphQLClient } from '../client';
import { useCallback, useMemo } from 'react';
import { TGraphQLParamsType } from '../../types';

const AWAKEN_GRAPHQL_URL_MAP: Record<string, string> = {
  test: 'https://test-indexer-api.aefinder.io/api/app/graphql/awaken',
  mainnet: 'https://indexer-api.aefinder.io/api/app/graphql/awaken',
};

export const useAwakenGraphQLClient = (isMainnet: boolean) => {
  return useMemo(() => {
    const url = isMainnet ? AWAKEN_GRAPHQL_URL_MAP['mainnet'] : AWAKEN_GRAPHQL_URL_MAP['test'];
    return getGraphQLClient(url);
  }, [isMainnet]);
};

export const useGetLimitOrderRemainingUnfilled = (isMainnet: boolean) => {
  const client = useAwakenGraphQLClient(isMainnet);
  return useCallback(
    (params: TGraphQLParamsType<typeof getLimitOrderRemainingUnfilled>) =>
      getLimitOrderRemainingUnfilled(client, params),
    [client],
  );
};

export const useGetPairReserve = (isMainnet: boolean) => {
  const client = useAwakenGraphQLClient(isMainnet);
  return useCallback((params: TGraphQLParamsType<typeof getPairReserve>) => getPairReserve(client, params), [client]);
};
