export type TAuthFinishResult = {
  type: 'Google' | 'Apple' | 'Telegram' | 'Facebook' | 'Twitter';
  status: 'success' | 'fail';
  data: string;
};

export interface IOpenloginSignalr {
  onAuthStatusChanged(
    params: {
      requestId: string;
    },
    callback: (data: TAuthFinishResult | null) => void,
  );
  onCheckSellResult(
    params: {
      requestId: string;
    },
    callback: (data: string | null) => void,
  );
}

export type TIOpenloginSignalrHandler = keyof IOpenloginSignalr;
