import { textProcessor } from './textProcessor';

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error?.Error) {
    return {
      message: error.Error.Details || error.Error.Message || error.Error || error.Status,
      code: error.Error.Code,
    };
  }
  return {
    code: req?.error?.message?.Code || req?.error,
    message: req?.errorMessage?.message || req?.error?.message?.Message,
  };
}

export const verifyErrorHandler = (error: any) => {
  // let _error = isVerifyApiError(error);
  let _error: string;
  if (error?.type) {
    _error = error.type;
  } else if (typeof error === 'string') {
    _error = error;
  } else {
    _error = error?.message || error?.error?.message || 'Verify error';
  }
  return _error;
};

export const handleError = (error: any) => {
  return error?.error || error;
};

export const handleErrorMessage = (error: any, errorText?: string) => {
  if (error.status === 500) {
    return errorText || 'Failed to fetch data';
  }
  error = handleError(error);
  error = handleContractError(error);
  if (typeof error === 'string') errorText = error;
  if (typeof error.message === 'string') errorText = error.message;
  return textProcessor.format(errorText || '') || '';
};

export const handleErrorCode = (error: any) => {
  return handleError(error)?.code;
};

export const contractErrorHandler = (error: any) => {
  if (typeof error === 'string') return error;
  return error?.Error?.Message || error?.message?.Message || error?.message || error?.Error;
};

export const getMissParams = (obj: object): string | undefined => {
  let _key;
  Object.entries(obj)
    .reverse()
    .map(([key, value]) => {
      if (!value) _key = key;
    });
  return _key;
};

export enum TipsLevelEnum {
  log = 'log',
  warn = 'warn',
  error = 'error',
  throwError = 'throwError',
  returnError = 'returnError',
}
