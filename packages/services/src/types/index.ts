import { IBaseRequest } from '@portkey/types';

export enum AccountTypeEnum {
  Email,
  Phone,
  Google,
  Apple,
  Telegram,
}

export const AccountTypeKeyEnum = {
  Email: 'Email',
  Phone: 'Phone',
  Google: 'Google',
  Apple: 'Apple',
  Telegram: 'Telegram',
};

export type AccountType = keyof typeof AccountTypeEnum;

export abstract class BaseService<T = IBaseRequest> {
  protected readonly _request: T;

  public constructor(request: T) {
    this._request = request;
  }
}

export type BaseListResponse<T = any> = {
  data: T[];
  totalRecordCount: number;
};

export type BaseApiResponse<T = any> = {
  code: string;
  message?: string;
  data: BaseListResponse<T>;
};

export * from './services';
export * from './communityRecovery';
export * from './search';
export * from './verification';
export * from './connect';
export * from './ramp';
export * from './assets';
export * from './token';
export * from './transaction';
export * from './activity';
export * from './security';
