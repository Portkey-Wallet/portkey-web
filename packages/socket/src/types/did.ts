export const DefaultDIDListenList = [
  'caAccountRegister',
  'caAccountRecover',
  'onScanLoginSuccess',
  'onScanLogin',
] as const;

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
