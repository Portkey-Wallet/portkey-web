import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface IGraphQLClient extends ApolloClient<NormalizedCacheObject> {}

export abstract class BaseGraphQL<T extends IGraphQLClient = IGraphQLClient> {
  protected readonly _client: T;

  public constructor(client: T) {
    this._client = client;
  }
}

export * from './did';
