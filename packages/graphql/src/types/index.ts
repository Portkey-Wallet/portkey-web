import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface IGraphQLClient extends ApolloClient<NormalizedCacheObject> {}

export abstract class BaseGraphQL<T extends IGraphQLClient = IGraphQLClient> {
  protected readonly _client: T;

  public constructor(client: T) {
    this._client = client;
  }
}

export type TGraphQLParamsType<T> = T extends (...arg: infer P) => any ? P[1] : T;

export * from './did';
