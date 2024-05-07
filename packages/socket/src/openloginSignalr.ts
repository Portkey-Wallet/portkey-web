import { BaseSignalr } from './signalr';
import { CrossTabPushMessageType, IOpenloginSignalr, TAuthFinishResult } from './types/openlogin';

export class OpenloginSignalr extends BaseSignalr implements IOpenloginSignalr {
  public onAuthStatusChanged(
    { requestId }: { requestId: string },
    callback: (data: TAuthFinishResult | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(
      CrossTabPushMessageType.onAuthStatusChanged,
      (data: { body: TAuthFinishResult; requestId: string }) => {
        console.log(CrossTabPushMessageType.onAuthStatusChanged, data, requestId);
        if (data?.requestId === requestId) {
          callback(data.body);
        } else {
          callback(null);
        }
      },
    );
  }

  public onSetLoginGuardianResult<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onSetLoginGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onSetLoginGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onSetLoginGuardianResult);
      } else {
        callback(null);
      }
    });
  }

  public onAddGuardianResult<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onAddGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onAddGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onAddGuardianResult);
      } else {
        callback(null);
      }
    });
  }

  public onEditGuardianResult<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onEditGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onEditGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onEditGuardianResult);
      } else {
        callback(null);
      }
    });
  }

  public onGuardianApprovalResult<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onGuardianApprovalResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onGuardianApprovalResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onRemoveGuardianResult<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onRemoveGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onRemoveGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onRemoveGuardianResult);
      } else {
        callback(null);
      }
    });
  }

  public onCheckSellResult(
    { requestId }: { requestId: string },
    callback: (data: string | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onCheckSellResult, (data: { body: string; requestId: string }) => {
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onTransferSettingApproval<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onTransferSettingApproval, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onTransferSettingApproval, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onTransferSettingApproval);
      } else {
        callback(null);
      }
    });
  }

  public onSendOneTimeApproval<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onSendOneTimeApproval, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onSendOneTimeApproval, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onSendOneTimeApproval);
      } else {
        callback(null);
      }
    });
  }

  public onSavePublicKey<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onSavePublicKey, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onSavePublicKey, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onSavePublicKey);
      } else {
        callback(null);
      }
    });
  }

  public onGetTelegramAuth<T>(
    { requestId }: { requestId: string },
    callback: (data: T | null, methodName?: CrossTabPushMessageType) => void,
  ) {
    return this.listen(CrossTabPushMessageType.onGetTelegramAuth, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onGetTelegramAuth, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body, CrossTabPushMessageType.onGetTelegramAuth);
      } else {
        callback(null);
      }
    });
  }

  public GetTabDataAsync({ requestId, methodName }: { requestId: string; methodName: CrossTabPushMessageType }) {
    return this.invoke('GetTabDataAsync', {
      clientId: requestId,
      methodName,
    });
  }
}

export const openloginListenList = [
  CrossTabPushMessageType.onAddGuardianResult,
  CrossTabPushMessageType.onEditGuardianResult,
  CrossTabPushMessageType.onGuardianApprovalResult,
  CrossTabPushMessageType.onGuardianApprovalResult,
  CrossTabPushMessageType.onRemoveGuardianResult,
  CrossTabPushMessageType.onSetLoginGuardianResult,
  CrossTabPushMessageType.onAuthStatusChanged,
  CrossTabPushMessageType.onCheckSellResult,
  CrossTabPushMessageType.onGetTelegramAuth,
] as const;
export type TOpenloginListenList = (typeof openloginListenList)[number];

export const openloginSignal = new OpenloginSignalr({
  listenList: openloginListenList,
}) as BaseSignalr<typeof openloginListenList> & OpenloginSignalr;
