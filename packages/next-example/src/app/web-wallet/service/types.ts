import { PortkeyResultType } from '../types/error';

type SendResponseParams = PortkeyResultType & { data?: any };
export type SendResponseFun = (response?: SendResponseParams) => void;

export type RequestCommonHandler<T = any> = (
  sendResponse: SendResponseFun,
  message: RequestMessagePayload<T>,
) => Promise<void>;

export interface BaseRequestMessagePayload {
  eventName: string;
  hostname: string;
  href: string;
  method: string;
  origin: string;
  icon?: string;
}

export interface RequestMessagePayload<T = any> extends BaseRequestMessagePayload {
  payload: T;
}
