import { OpenloginParamConfig, PopupResponse } from '../utils/openlogin/types';

export type TOpenLoginQueryParams = OpenloginParamConfig;

export interface IOpenloginHandlerResult {
  data?: PopupResponse;
  methodName?: string;
}
