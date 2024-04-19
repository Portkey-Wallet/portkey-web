import { IListen } from './signalr';

export enum CrossTabPushMessageType {
  onAuthStatusChanged = 'onAuthStatusChanged',
  onSavePublicKey = 'onSavePublicKey',
  onSetLoginGuardianResult = 'onSetLoginGuardianResult',
  onAddGuardianResult = 'onAddGuardianResult',
  onRemoveGuardianResult = 'onRemoveGuardianResult',
  onEditGuardianResult = 'onEditGuardianResult',
  onGuardianApprovalResult = 'onGuardianApprovalResult',
  onCheckSellResult = 'onCheckSellResult',
  onTransferSettingApproval = 'onTransferSettingApproval',
  onSendOneTimeApproval = 'onSendOneTimeApproval',
}

export type TAuthFinishResult = {
  type: 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';
  status: 'success' | 'fail';
  data: string;
};

export interface IOpenloginSignalr {
  onSavePublicKey<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onAuthStatusChanged(
    params: {
      requestId: string;
    },
    callback: (data: TAuthFinishResult | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onSetLoginGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onAddGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onRemoveGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onEditGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onGuardianApprovalResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onTransferSettingApproval<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onSendOneTimeApproval<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;

  onCheckSellResult(
    params: {
      requestId: string;
    },
    callback: (data: string | null, methodName?: CrossTabPushMessageType) => void,
  ): IListen;
}

export type TIOpenloginSignalrHandler = keyof IOpenloginSignalr;
