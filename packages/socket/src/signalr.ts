import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { randomId } from '@portkey/utils';
import { IListen, IMessageMap, ISignalr, ISignalrOptions, Receive, SocketError } from './types';

export class BaseSignalr<ListenList = any> implements ISignalr<ListenList> {
  public url?: string;
  public signalr: HubConnection | null;
  public connectionId: string;
  private _messageMap: IMessageMap;
  private _listenList: ListenList;
  constructor({ listenList }: ISignalrOptions<ListenList>) {
    this.connectionId = '';
    this._messageMap = {};
    this.signalr = null;
    this._listenList = listenList;
  }

  public doOpen = async ({ url, clientId }: { url: string; clientId: string }) => {
    const signalr = new HubConnectionBuilder()
      .withUrl(url, { withCredentials: false })
      .withAutomaticReconnect()
      .build();
    this._listener(signalr);
    if (this.signalr) await this.signalr.stop();
    await signalr.start();
    await signalr.invoke('Connect', clientId);
    this.connectionId = signalr.connectionId ?? '';
    this.signalr = signalr;
    this.url = url;
    return signalr;
  };

  public listen = (name: ListenList[keyof ListenList], handler: (data?: any) => void): IListen => {
    const key = randomId();
    let _name = name as string;
    if (!this._messageMap[_name]) this._messageMap[_name] = {};
    this._messageMap[_name][key] = handler;
    return {
      remove: () => {
        delete this._messageMap[_name][key];
      },
    };
  };

  public start: HubConnection['start'] = (...args) => {
    return this._checkSignalr().start(...args);
  };

  public on: HubConnection['on'] = (...args) => {
    return this._checkSignalr().on(...args);
  };

  public invoke: HubConnection['invoke'] = (...args) => {
    return this._checkSignalr().invoke(...args);
  };

  public onClose: HubConnection['onclose'] = (...args) => {
    return this._checkSignalr().onclose(...args);
  };

  public stop: HubConnection['stop'] = (...args) => {
    return this._checkSignalr().stop(...args);
  };

  public destroy: HubConnection['stop'] = () => {
    this._messageMap = {};
    return this._checkSignalr().stop();
  };

  private _listener(signalr: HubConnection) {
    (this._listenList as string[]).forEach(listenType => {
      signalr.on(listenType, (data: any) => {
        this._onReceiver({ Event: listenType, Data: data });
      });
    });
  }

  private _onReceiver(data: Receive): void {
    const callback = this._messageMap[data.Event];
    callback &&
      Object.values(callback).forEach(handler => {
        handler(data.Data);
      });
  }

  private _checkSignalr() {
    if (!this.signalr) throw SocketError.notConnect;
    return this.signalr;
  }
}
