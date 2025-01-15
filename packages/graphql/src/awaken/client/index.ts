import { getGraphQLClientProvider } from '../../client';
import { IGraphQLClient } from '../../types';

export const graphQLClientMap: Record<string, IGraphQLClient> = {};

export const getGraphQLClient = (graphqlUrl: string) => {
  if (graphQLClientMap[graphqlUrl]) {
    return graphQLClientMap[graphqlUrl];
  }
  const client = getGraphQLClientProvider(graphqlUrl);
  graphQLClientMap[graphqlUrl] = client;
  return client;
};
