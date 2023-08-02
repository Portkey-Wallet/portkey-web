import { ChainType } from '@portkey/types';
// import { portkeyDidUIPrefix } from '../../constants';

export enum SandboxEventTypes {
  getBalances = '@portkey/did-ui-sdk:getBalances',
  // View
  callViewMethod = '@portkey/did-ui-sdk:callViewMethod',
  // Send
  callSendMethod = '@portkey/did-ui-sdk:callSendMethod',
  // getEncodedTx
  getTransactionFee = '@portkey/did-ui-sdk:getTransactionFee',
  // getTransactionRaw
  getTransactionRaw = 'getTransactionRaw',

  initViewContract = '@portkey/did-ui-sdk:initViewContract',
}

export enum SandboxErrorCode {
  error,
  success,
} // 0 error 1 success

export type SandboxDispatchData = { code: SandboxErrorCode; message?: any };

export interface DispatchParam {
  chainType: ChainType;
  rpcUrl: string;
  [x: string]: any;
}
