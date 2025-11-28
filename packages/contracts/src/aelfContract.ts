import { aelf, sleep } from '@portkey/utils';
import { CallOptions, SendOptions, SendResult, ViewResult } from '@portkey/types';
import { ChainId } from '@portkey/types';

import { ContractProps, IPortkeyContract } from './types';
import { getTxResult, handleContractError, handleContractParams, handleFunctionName } from './utils';
import { BaseContract } from './baseContract';
export type AElfCallViewMethod = (functionName: string, paramsOption?: any) => Promise<ViewResult>;

export class AElfContract extends BaseContract implements IPortkeyContract {
  public aelfContract: any;
  public aelfInstance?: any;
  public chainId?: ChainId;
  constructor(options: ContractProps) {
    super(options);
    const { aelfContract, contractAddress, aelfInstance } = options;
    this.address = contractAddress;
    this.aelfContract = aelfContract;
    this.aelfInstance = aelfInstance;
  }
  public async calculateTransactionFee(functionName: any, paramsOption: any) {
    try {
      const { data } = await this.encodedTx(functionName, paramsOption);
      const req = await this.aelfInstance?.chain.calculateTransactionFee(data);
      return { data: req };
    } catch (error) {
      return { error: handleContractError(error) };
    }
  }
  public async callViewMethod<T = any>(
    functionName: string,
    paramsOption?: any,
    _callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    const contract = this.aelfContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      const req = await contract[handleFunctionName(functionName)].call(paramsOption);
      if (!req?.error && (req?.result || req?.result === null)) return { data: req.result };
      return { data: req };
    } catch (error) {
      return { error: handleContractError(error) };
    }
  }

  public async callSendMethod<T = any>(
    functionName: string,
    _account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error' } };
    try {
      const { onMethod = 'receipt', refBlockNumberStrategy } = sendOptions || {};
      const _functionName = handleFunctionName(functionName);
      const _params = await handleContractParams({
        instance: this.aelfInstance,
        paramsOption,
        functionName: _functionName,
      });
      const contractSendOption = { refBlockNumberStrategy };
      const req = await this.aelfContract[_functionName](_params, contractSendOption);

      const { TransactionId } = req.result || req;
      if (req.error) return { error: handleContractError(undefined, req), transactionId: TransactionId };

      // receipt
      if (onMethod === 'receipt') {
        await sleep(1000);
        try {
          const txResult = await getTxResult(this.aelfInstance, TransactionId);
          return { data: txResult as T, transactionId: TransactionId };
        } catch (error) {
          return { error: handleContractError(error, req), transactionId: TransactionId };
        }
      }

      // transactionHash
      return { transactionId: TransactionId };
    } catch (error) {
      return { error: handleContractError(error) };
    }
  }

  public async encodedTx<T = any>(
    functionName: string,
    paramsOption?: any,
    callOptions?: CallOptions,
  ): Promise<ViewResult<T>> {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error' } };
    if (!this.aelfInstance) return { error: { code: 401, message: 'instance init error' } };
    try {
      const _functionName = handleFunctionName(functionName);
      const _params = await handleContractParams({
        instance: this.aelfInstance,
        paramsOption: {
          ...paramsOption,
          ...callOptions?.appendParams,
        },
        functionName: _functionName,
      });
      const data = await aelf.encodedTx({
        instance: this.aelfInstance,
        contract: this.aelfContract,
        paramsOption: _params,
        functionName: _functionName,
      });
      return { data };
    } catch (error) {
      return handleContractError(error);
    }
  }
}
