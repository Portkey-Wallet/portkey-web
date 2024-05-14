import { EventEmitter } from 'events';

import { getPopupFeatures } from './utils';
import { openloginSignal, TIOpenloginSignalrHandler, IOpenloginSignalr } from '@portkey/socket';
import { modalMethod } from '../modalMethod';
import PortkeyOpener from '../portkeyWindow/opener';
import { TelegramPlatform } from '../telegramPlatform';

class PopupHandler extends EventEmitter {
  url?: string;

  target: string;
  socketURI: string;

  features: string;
  socketInstance?: typeof openloginSignal;

  window?: Window | null;

  windowTimer?: number;

  iClosedWindow: boolean;

  timeout: number;
  invokeTimer?: number;

  constructor({
    url,
    target,
    features,
    timeout = 1000,
    socketURI,
  }: {
    url?: string;

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
    this.invokeTimer = undefined;
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

  open({ needConfirm = false }: { needConfirm?: boolean } = {}): void {
    if (!this.url) return;
    if (TelegramPlatform.isTelegramPlatform() && needConfirm) {
      modalMethod({
        zIndex: 10030,
        wrapClassName: 'portkey-ui-open-link-confirm-modal',
        content: <div className="portkey-ui-open-link-confirm-modal-content">Open link?</div>,
        onOk: () => {
          PortkeyOpener.open(this.url);
        },
      });
    } else {
      this.window = window.open(this.url, this.target, this.features);
    }
    if (TelegramPlatform.isTelegramPlatform()) return;
    this._setupTimer();
    if (!this.window) throw 'Popup was blocked. Please check your browser settings.';
    if (this.window?.focus) this.window.focus();
  }

  close(): void {
    this.iClosedWindow = true;
    if (this.window) this.window.close();
  }

  redirect(locationReplaceOnRedirect: boolean): void {
    if (!this.url) return;
    if (locationReplaceOnRedirect) {
      window.location.replace(this.url);
    } else {
      window.location.href = this.url;
    }
  }

  async getResultByInvoke(clientId: string, methodName: string) {
    return new Promise(async (resolve) => {
      if (this.invokeTimer) clearInterval(this.invokeTimer);
      this.invokeTimer = Number(
        setInterval(async () => {
          const result = await openloginSignal.GetTabDataAsync({
            requestId: clientId,
            methodName: methodName as any,
          });
          console.log(result, 'getResultByInvoke result===');
          result?.data && resolve(result.data);
        }, 1000),
      );
    });
  }

  async getResultByListener(clientId: string, methodName: keyof IOpenloginSignalr): Promise<any> {
    return new Promise((resolve) => {
      openloginSignal[methodName]({ requestId: clientId }, (result: any) => {
        console.log(result, 'getResultByListener result===');
        const message = result;
        resolve(message);
      });
    });
  }

  async listenOnChannel(clientId: string, methodNames: TIOpenloginSignalrHandler[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await openloginSignal.doOpen({
          url: this.socketURI,
          clientId,
        });

        this.emit('socket-connect', true);

        methodNames.forEach(async (methodName) => {
          // 1. get result by invoke;
          // 2. get result by socket listener

          const result = await Promise.race([
            this.getResultByInvoke(clientId, methodName),
            this.getResultByListener(clientId, methodName),
          ]);

          this.invokeTimer && clearInterval(this.invokeTimer);
          this.invokeTimer = undefined;

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
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default PopupHandler;
