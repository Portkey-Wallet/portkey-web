import { EventEmitter } from 'events';

import { getPopupFeatures } from './utils';
import { openloginSignal, TIOpenloginSignalrHandler, CrossTabPushMessageType } from '@portkey/socket';
import { ISocialLogin } from '../../types';
import { isTelegramPlatform } from '../telegram';

export interface PopupResponse {
  token: string;
  provider: ISocialLogin;
  code?: string;
  message?: string;
}
class PopupHandler extends EventEmitter {
  url: string;

  target: string;
  socketURI: string;

  features: string;
  socketInstance?: typeof openloginSignal;

  window?: Window | null;

  windowTimer?: number;

  iClosedWindow: boolean;

  timeout: number;

  constructor({
    url,
    target,
    features,
    timeout = 1000,
    socketURI,
  }: {
    url: string;

    target?: string;
    features?: string;
    timeout?: number;
    socketURI: string;
  }) {
    super();
    this.url = url;
    this.socketURI = socketURI;
    this.target = target || '_blank';
    this.features = features || getPopupFeatures();
    this.window = undefined;
    this.windowTimer = undefined;
    this.iClosedWindow = false;
    this.timeout = timeout;
  }

  _setupTimer(): void {
    this.windowTimer = Number(
      setInterval(() => {
        if (this.window && this.window.closed) {
          clearInterval(this.windowTimer);
          setTimeout(() => {
            this.emit('close');
            this.iClosedWindow = false;
            this.window = undefined;
            this.socketInstance?.destroy();
            this.socketInstance = undefined;
          }, this.timeout);
        }
        if (this.window === undefined) clearInterval(this.windowTimer);
      }, 1600),
    );
  }

  open(): void {
    this.window = window.open(this.url, this.target, this.features);
    this._setupTimer();
    if (isTelegramPlatform()) return;
    if (!this.window) throw 'Popup was blocked. Please check your browser settings.';
    if (this.window?.focus) this.window.focus();
  }

  close(): void {
    this.iClosedWindow = true;
    if (this.window) this.window.close();
  }

  redirect(locationReplaceOnRedirect: boolean): void {
    if (locationReplaceOnRedirect) {
      window.location.replace(this.url);
    } else {
      window.location.href = this.url;
    }
  }

  async listenOnChannel(clientId: string, methodNames: TIOpenloginSignalrHandler[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await openloginSignal.doOpen({
          url: this.socketURI,
          clientId,
        });

        this.emit('socket-connect', true);
        methodNames.forEach((methodName) => {
          openloginSignal[methodName]({ requestId: clientId }, (result: any, methodName?: CrossTabPushMessageType) => {
            console.log(result);
            const message = result;
            if (!message) return;
            try {
              resolve({ message: JSON.parse(message), methodName });
            } catch (error) {
              resolve({ message, methodName });
            }
            openloginSignal.destroy();
            this.close();
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default PopupHandler;
