export enum CrossTabPushMessageType {
  onAuthStatusChanged = 'onAuthStatusChanged',
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
  onAuthStatusChanged(
    params: {
      requestId: string;
    },
    callback: (data: TAuthFinishResult | null) => void,
  );

  onSetLoginGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null) => void,
  );

  onAddGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null) => void,
  );

  onRemoveGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null) => void,
  );

  onEditGuardianResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null) => void,
  );

  onGuardianApprovalResult<T>(
    params: {
      requestId: string;
    },
    callback: (data: T | null) => void,
  );

  onCheckSellResult(
    params: {
      requestId: string;
    },
    callback: (data: string | null) => void,
  );
}

export type TIOpenloginSignalrHandler = keyof IOpenloginSignalr;
