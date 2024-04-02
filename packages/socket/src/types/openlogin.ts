export enum CrossTabPushMessageType {
  onAuthStatusChanged = 'onAuthStatusChanged',
  onSavePublicKey = 'onSavePublicKey',
  onSetLoginGuardianResult = 'onSetLoginGuardianResult',
  onAddGuardianResult = 'onAddGuardianResult',
  onRemoveGuardianResult = 'onRemoveGuardianResult',
  onEditGuardianResult = 'onEditGuardianResult',
  onGuardianApprovalResult = 'onGuardianApprovalResult',
  onCheckSellResult = 'onCheckSellResult',
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
  );

  onAuthStatusChanged(
    params: {
      requestId: string;
    },
    callback: (data: TAuthFinishResult | null, methodName?: CrossTabPushMessageType) => void,
  );

  onSetLoginGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  );

  onAddGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  );

  onRemoveGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  );

  onEditGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  );

  onGuardianApprovalResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  );

  onCheckSellResult(
    params: {
      requestId: string;
    },
    callback: (data: string | null, methodName?: CrossTabPushMessageType) => void,
  );
}

export type TIOpenloginSignalrHandler = keyof IOpenloginSignalr;
