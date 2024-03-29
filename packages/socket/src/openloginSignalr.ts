import { BaseSignalr } from './signalr';
import { CrossTabPushMessageType, IOpenloginSignalr, TAuthFinishResult } from './types/openlogin';

export class OpenloginSignalr extends BaseSignalr implements IOpenloginSignalr {
  public onAuthStatusChanged({ requestId }: { requestId: string }, callback: (data: TAuthFinishResult | null) => void) {
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

  public onSetLoginGuardianResult<T>({ requestId }: { requestId: string }, callback: (data: T | null) => void) {
    return this.listen(CrossTabPushMessageType.onSetLoginGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onSetLoginGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onAddGuardianResult<T>({ requestId }: { requestId: string }, callback: (data: T | null) => void) {
    return this.listen(CrossTabPushMessageType.onAddGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onAddGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onEditGuardianResult<T>({ requestId }: { requestId: string }, callback: (data: T | null) => void) {
    return this.listen(CrossTabPushMessageType.onEditGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onEditGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onGuardianApprovalResult<T>({ requestId }: { requestId: string }, callback: (data: T | null) => void) {
    return this.listen(CrossTabPushMessageType.onGuardianApprovalResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onGuardianApprovalResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onRemoveGuardianResult<T>({ requestId }: { requestId: string }, callback: (data: T | null) => void) {
    return this.listen(CrossTabPushMessageType.onRemoveGuardianResult, (data: { body: T; requestId: string }) => {
      console.log(CrossTabPushMessageType.onRemoveGuardianResult, data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public onCheckSellResult({ requestId }: { requestId: string }, callback: (data: string | null) => void) {
    return this.listen(CrossTabPushMessageType.onCheckSellResult, (data: { body: string; requestId: string }) => {
      if (data?.requestId === requestId) {
        callback(data.body);
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
] as const;
export type TOpenloginListenList = (typeof openloginListenList)[number];

export const openloginSignal = new OpenloginSignalr({
  listenList: openloginListenList,
}) as BaseSignalr<typeof openloginListenList> & OpenloginSignalr;
