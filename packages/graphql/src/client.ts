import { ApolloClient, InMemoryCache, HttpLink, DefaultOptions } from '@apollo/client';
import { IGraphQLClient } from './types';

export const getGraphQLClientProvider = (graphqlUrl: string, defaultOptions: DefaultOptions = {}): IGraphQLClient =>
  new ApolloClient({
    cache: new InMemoryCache(),
    queryDeduplication: false,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
      query: {
        fetchPolicy: 'network-only',
      },
      ...defaultOptions,
    },
    link: new HttpLink({ uri: graphqlUrl }),
  });
