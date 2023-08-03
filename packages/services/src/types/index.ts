import { IBaseRequest } from '@portkey/types';

export enum AccountTypeEnum {
  Email,
  Phone,
  Google,
  Apple,
}

export type AccountType = keyof typeof AccountTypeEnum;

export abstract class BaseService<T = IBaseRequest> {
  protected readonly _request: T;

  public constructor(request: T) {
    this._request = request;
  }
}

export * from './communityRecovery';
export * from './search';
export * from './verification';
export * from './connect';
export * from './ramp';
export * from './assets';
export * from './services';
