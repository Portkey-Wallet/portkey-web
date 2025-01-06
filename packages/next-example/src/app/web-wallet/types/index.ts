export interface IRequestPayload {
  method: string;
  eventName: string;
  origin: string;
  payload: any;
}

export enum WalletPageType {
  Login = 'Login',
  Assets = 'Assets',
  UnLock = 'UnLock',
}
