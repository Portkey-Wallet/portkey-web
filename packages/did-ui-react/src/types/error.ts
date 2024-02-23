export interface ErrorInfo<T = any> {
  errorFields: string;
  error: T;
}

export type OnErrorFunc<T = any> = (error: ErrorInfo<T>) => void;
