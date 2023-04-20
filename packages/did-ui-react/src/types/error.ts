export interface ErrorInfo {
  errorFields: string;
  error: any;
}

export type OnErrorFunc = (error: ErrorInfo) => void;
