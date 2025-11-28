import { PortkeyResultType, RESPONSE_ERROR_MAP } from '../types/error';

export default function errorHandler(code: keyof typeof RESPONSE_ERROR_MAP, error?: any | string): PortkeyResultType {
  const errorMessage = RESPONSE_ERROR_MAP[code];
  let output: PortkeyResultType = {
    error: code,
    message: '',
  };
  if (code === 0) {
    // success
  } else if (typeof error === 'string') {
    output = {
      ...output,
      name: 'customError',
      message: error,
    };
  } else if (typeof error === 'object') {
    console.log(error, 'errorHandler');
    output = {
      ...output,
      name: error.name,
      message: error?.error?.message || error.message || error.Error?.Message || error.Error,
      stack: error.stack,
      data: error.data,
    };
  } else {
    output = {
      ...output,
      name: 'errorMap',
      message: errorMessage,
    };
  }
  return output;
}
