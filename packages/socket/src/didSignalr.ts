import { BaseSignalr } from './signalr';
import { BaseSocketMessage } from './types';
import { CaAccountRecoverResult, CaAccountRegisterResult } from './types/did';

export class DIDSignalr<T = any> extends BaseSignalr<T> {
  public Ack(clientId: string, requestId: string) {
    this.invoke('Ack', clientId, requestId);
  }

  public onCaAccountRegister(
    { clientId, requestId }: { clientId: string; requestId: string },
    callback: (data: CaAccountRegisterResult) => void,
  ) {
    return this.listen('caAccountRegister' as T[keyof T], (data: CaAccountRegisterResult) => {
      if (data.requestId === requestId) {
        if (data.body.registerStatus !== 'pending') {
          this.Ack(clientId, requestId);
        }
        callback(data);
      }
    });
  }

  public onCaAccountRecover(
    { clientId, requestId }: { clientId: string; requestId: string },
    callback: (data: CaAccountRecoverResult) => void,
  ) {
    return this.listen('caAccountRecover' as T[keyof T], (data: CaAccountRecoverResult) => {
      if (data.requestId === requestId) {
        if (data.body.recoveryStatus !== 'pending') {
          this.Ack(clientId, requestId);
        }
        callback(data);
      }
    });
  }

  public onScanLoginSuccess(callback: (data: BaseSocketMessage) => void) {
    return this.listen('onScanLoginSuccess' as T[keyof T], (data: BaseSocketMessage) => {
      if (typeof data?.body === 'string') {
        callback(data);
        this.stop();
      }
    });
  }

  public onScanLogin(callback: (data: BaseSocketMessage) => void) {
    return this.listen('onScanLogin' as T[keyof T], (data: BaseSocketMessage) => {
      if (typeof data?.body === 'string') {
        callback(data);
        this.stop();
      }
    });
  }
}
