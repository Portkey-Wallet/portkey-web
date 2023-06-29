export interface ISignalrOption<T> {
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

export * from './did';
