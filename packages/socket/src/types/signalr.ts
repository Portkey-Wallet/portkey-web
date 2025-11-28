import { HubConnection } from '@microsoft/signalr';

export interface ISignalrOptions<T> {
  listenList: T;
}

export interface IMessageMap {
  [eventName: string]: {
    [key: string]: (data?: any) => void;
  };
}

export interface Receive {
  Event: string;
  Data?: any;
}

export enum SocketError {
  notConnect = 'Signalr is null, please doOpen',
}

export type BaseSocketMessage = {
  body: string;
};

export interface IListen {
  remove(): void;
}

export interface ISignalr<T> {
  doOpen: ({ url, clientId }: { url: string; clientId: string }) => Promise<HubConnection>;
  listen: (name: T[keyof T], handler: (data?: any) => void) => IListen;
  start: HubConnection['start'];
  invoke: HubConnection['invoke'];
  onClose: HubConnection['onclose'];
  stop: HubConnection['stop'];
  on: HubConnection['on'];
  destroy: HubConnection['stop'];
}
