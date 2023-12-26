import { ChainType } from '@portkey-v1/types';
// import { portkeyDidUIPrefix } from '../../constants';

export enum SandboxEventTypes {
  getBalances = '@portkey-v1/did-ui-sdk:getBalances',
  // View
  callViewMethod = '@portkey-v1/did-ui-sdk:callViewMethod',
  // Send
  callSendMethod = '@portkey-v1/did-ui-sdk:callSendMethod',
  // getEncodedTx
  getTransactionFee = '@portkey-v1/did-ui-sdk:getTransactionFee',
  // getTransactionRaw
  getTransactionRaw = 'getTransactionRaw',

  callCASendMethod = '@portkey-v1/did-ui-sdk:callCASendMethod',

  callSendMethodFormat = '@portkey-v1/did-ui-sdk:callSendMethodFormat',
  callViewMethodFormat = '@portkey-v1/did-ui-sdk:callViewMethodFormat',
  encodedTx = '@portkey-v1/did-ui-sdk:encodedTx',
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
