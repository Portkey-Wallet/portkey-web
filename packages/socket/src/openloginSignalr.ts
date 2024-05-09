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

  public GetTabDataAsync({ requestId, methodName }: { requestId: string; methodName: CrossTabPushMessageType }) {
    return this.invoke('GetTabDataAsync', {
      clientId: requestId,
      methodName,
    });
  }
}

export const openloginListenList = [
  CrossTabPushMessageType.onAuthStatusChanged,
  CrossTabPushMessageType.onCheckSellResult,
] as const;
export type TOpenloginListenList = (typeof openloginListenList)[number];

export const openloginSignal = new OpenloginSignalr({
  listenList: openloginListenList,
}) as BaseSignalr<typeof openloginListenList> & OpenloginSignalr;
