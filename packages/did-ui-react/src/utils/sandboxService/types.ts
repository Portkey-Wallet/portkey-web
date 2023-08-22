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

  callCASendMethod = '@portkey/did-ui-sdk:callCASendMethod',

  callSendMethodFormat = '@portkey/did-ui-sdk:callSendMethodFormat',
  callViewMethodFormat = '@portkey/did-ui-sdk:callViewMethodFormat',
  encodedTx = '@portkey/did-ui-sdk:encodedTx',
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
