import { BaseSignalr } from './signalr';
import { IOpenloginSignalr, TAuthFinishResult } from './types/openlogin';

export class OpenloginSignalr extends BaseSignalr implements IOpenloginSignalr {
  public onAuthStatusChanged({ requestId }: { requestId: string }, callback: (data: TAuthFinishResult | null) => void) {
    return this.listen('onAuthStatusChanged', (data: { body: TAuthFinishResult; requestId: string }) => {
      console.log('onAuthStatusChanged:', data, requestId);
      if (data?.requestId === requestId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }
}

export const openloginListenList = ['onAuthStatusChanged'] as const;
export type TOpenloginListenList = (typeof openloginListenList)[number];

export const openloginSignal = new OpenloginSignalr({
  listenList: openloginListenList,
}) as BaseSignalr<typeof openloginListenList> & OpenloginSignalr;
