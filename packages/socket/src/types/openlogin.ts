import { IListen } from './signalr';

export enum CrossTabPushMessageType {
  onAuthStatusChanged = 'onAuthStatusChanged',
  onCheckSellResult = 'onCheckSellResult',
}

export type TAuthFinishResult = {
  type: 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';
  status: 'success' | 'fail';
  data: string;
};

export interface IOpenloginSignalr {
  onAuthStatusChanged(
    params: {
      requestId: string;
    },
    callback: (data: TAuthFinishResult | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onCheckSellResult(
    params: {
      requestId: string;
    },
    callback: (data: string | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;
}

export type TIOpenloginSignalrHandler = keyof IOpenloginSignalr;
