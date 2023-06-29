import { BaseSocketMessage, IListen, ISignalr } from './signalr';

export const DefaultDIDListenList = [
  'caAccountRegister',
  'caAccountRecover',
  'onScanLoginSuccess',
  'onScanLogin',
] as const;

export type DefaultDIDListenListType = typeof DefaultDIDListenList;

export type RegisterStatus = 'pass' | 'pending' | 'fail' | null;

export interface RegisterBody {
  caAddress: string;
  caHash: string;
  registerMessage: null | string;
  registerStatus: RegisterStatus;
}

export interface RecoverBody {
  caAddress: string;
  caHash: string;
  recoveryMessage: null | string;
  recoveryStatus: RegisterStatus;
}

export interface CaAccountRegisterResult {
  requestId: string;
  body: RegisterBody;
}

export interface CaAccountRecoverResult {
  requestId: string;
  body: RecoverBody;
}

export interface IDIDSignalr<T> extends ISignalr<T> {
  onCaAccountRegister(
    { clientId, requestId }: { clientId: string; requestId: string },
    callback: (data: CaAccountRegisterResult) => void,
  ): IListen;
  onCaAccountRecover(
    { clientId, requestId }: { clientId: string; requestId: string },
    callback: (data: CaAccountRecoverResult) => void,
  ): IListen;
  onScanLoginSuccess(callback: (data: BaseSocketMessage) => void): IListen;
  onScanLogin(callback: (data: BaseSocketMessage) => void): IListen;
}
