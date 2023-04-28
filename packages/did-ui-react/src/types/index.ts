export * from './error';
export * from './guardian';
export * from './network';
export * from './wallet';
export * from './country';
export * from './device';

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
