import { Form } from 'antd';
import { SvgType } from './assets';

export * from './error';
export * from './guardian';
export * from './wallet';
export * from './country';
export * from './device';
export * from './ramp';
export * from './assets';

type GenerateType<T> = {
  [K in keyof T]: T[K];
};

export type PartialOption<T, K extends keyof T> = GenerateType<Partial<Pick<T, K>> & Omit<T, K>>;

export interface Storage {
  getItem(key: string, ...args: Array<any>): any;
  setItem(key: string, value: any, ...args: Array<any>): any;
  removeItem(key: string, ...args: Array<any>): any;
}

export type ValidatorHandler = (value?: string) => Promise<any>;

export type OpacityType = number; // 0-1

export interface LoadingInfo {
  text?: string;
  cancelable?: boolean;
  onCancel?: () => void;
}

export type LoadingInfoType = LoadingInfo | string;

export enum UseRecaptcha {
  register = 0,
  communityRecovery = 1,
  optGuardian = 2,
}

export interface IKeyDownParams {
  key: string;
  preventDefault: () => any;
}

export type BaseListInfo<T> = {
  list: T[];
  skipCount: number;
  maxResultCount: number;
  totalRecordCount: number;
};

export interface PaginationPage {
  pageSize: number;
  page: number;
}

export interface IMenuItemType {
  label: string;
  icon?: SvgType;
  onClick: () => void;
}

type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];
export type ValidData = {
  validateStatus: ValidateStatus;
  errorMsg: string;
};

export type TCustomNetworkType = 'offline' | 'online' | 'local';
