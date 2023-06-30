import type { ec } from 'elliptic';

export type AElfAddress = string;
export type AElfBlockHeight = number;
export type AElfChainId = string;
export type PublicKey = {
  x: string;
  y: string;
};
export type AElfWallet = {
  address: string;
  privateKey?: string;
  childWallet?: string;
  BIP44Path?: string;
  keyPair?: ec.KeyPair;
};
export type Block = {
  BlockHash: string;
  Header: any;
  Body: any;
  BlockSize: number;
};

export type NightElfErrorMessage = {
  message: {
    Code: null | string;
    Data: any;
    Details: null | string;
    Message: null | string;
    ValidationErrors: null | string;
  };
};

export type NightElfResult<T> = {
  error: number;
  errorMessage: string & NightElfErrorMessage;
  from: 'contentNightElf';
  result: T | undefined;
  sid: string;
};
export type AElfSDKError = {
  code: number;
  error: any;
  mag: string;
};
export type ChainStatus = {
  BestChainHash: string;
  BestChainHeight: AElfBlockHeight;
  Branches: { [key: string]: number };
  ChainId: AElfChainId;
  GenesisBlockHash: string;
  GenesisContractAddress: string;
  LastIrreversibleBlockHash: string;
  LastIrreversibleBlockHeight: number;
  LongestChainHash: string;
  LongestChainHeight: number;
  NotLinkedBlocks: any;
};

export type AElfTransaction = {
  From: string;
  To: string;
  RefBlockNumber: AElfBlockHeight;
  RefBlockPrefix: string;
  Params: string;
  Signature: string;
  MethodName: string;
};
export type TransactionStatus =
  | 'MINED'
  | 'PENDING'
  | 'NOT_EXISTED'
  | 'FAILED'
  | 'CONFLICT'
  | 'PENDING_VALIDATION'
  | 'NODE_VALIDATION_FAILED';

export type TransactionResult = {
  BlockHash: string;
  BlockNumber: AElfBlockHeight;
  Bloom: string;
  Error: null | any;
  Logs: any;
  ReturnValue: any;
  Status: TransactionStatus;
  Transaction: AElfTransaction;
  TransactionId: string;
  TransactionSize: number;
};

export type ExtensionInfo = {
  detail: string;
  error: number;
  errorMessage: string & NightElfErrorMessage;
  from: 'contentNightElf';
  sid: string;
};

export type ChainMethodResult<T> = T & NightElfResult<T> & AElfSDKError;

// aelf-bridge returns the result directly NightElf will return the result in the result
export interface IAElfRPCMethods {
  /**
   *
   * Get contract instance
   * It is different from the wallet created by Aelf.wallet.getWalletByPrivateKey();
   * There is only one value named address;
   */
  contractAt(address: string, wallet: AElfWallet): Promise<ChainMethodResult<any>>;
  /**
   * Get block information by block hash.
   */
  getBlock(blockHash: string, includeTransactions?: boolean): Promise<ChainMethodResult<Block>>;
  /**
   * Get block information by block height.
   */
  getBlockByHeight(blockHeight: number, includeTransactions?: boolean): Promise<ChainMethodResult<Block>>;
  /**
   * Get current best height of the chain.
   */
  getBlockHeight(): Promise<ChainMethodResult<number>>;
  /**
   * Get chain state
   */
  getChainState(...args: unknown[]): Promise<ChainMethodResult<any>>;
  /**
   * Get chain status
   */
  getChainStatus(...args: unknown[]): Promise<ChainMethodResult<ChainStatus>>;
  /**
   * Get the protobuf definitions related to a contract
   */
  getContractFileDescriptorSet(contractAddress: string): Promise<ChainMethodResult<string>>;
  /**
   * Get the transaction pool status.
   */
  getTransactionPoolStatus(): Promise<ChainMethodResult<any>>;
  /**
   * Get the result of a transaction
   */
  getTxResult(transactionId: string): Promise<ChainMethodResult<TransactionResult>>;
  /**
   * Get multiple transaction results in a block
   */
  getTxResults(blockHash: string, offset?: number, limit?: number): Promise<ChainMethodResult<TransactionResult[]>>;
  /**
   * Broadcast a transaction
   */
  sendTransaction(...args: unknown[]): Promise<ChainMethodResult<any>>;
  /**
   * Broadcast a transactions
   */
  sendTransactions(...args: unknown[]): Promise<ChainMethodResult<any>>;
}
