import { sleep } from '@portkey/utils';
import { getTxResult, handleContractError, handleContractParams, handleFunctionName } from '.';
import { AElfCallSendMethod, AElfCallViewMethod, CallSendMethod, CallViewMethod, ContractProps } from './types';
import { aelf } from '@portkey/utils';
export class ContractBasic {
  public address?: string;
  public callContract: Web3ContractBasic | AElfContractBasic;
  public chainType: 'aelf' | 'ethereum';
  public rpcUrl: string;
  constructor(options: ContractProps) {
    this.address = options.contractAddress;
    this.rpcUrl = options.rpcUrl;
    const isELF = true;
    // TODO :ethereum
    this.callContract = isELF ? new AElfContractBasic(options) : new Web3ContractBasic();
    this.chainType = isELF ? 'aelf' : 'ethereum';
  }

  public callViewMethod: CallViewMethod = async (
    functionName,
    paramsOption,
    _callOptions = { defaultBlock: 'latest' },
  ) => {
    if (this.callContract instanceof AElfContractBasic)
      return this.callContract.callViewMethod(functionName, paramsOption);

    // TODO WEB3 Contract
    return { data: '' };
  };

  public callSendMethod: CallSendMethod = async (functionName, _account, paramsOption, sendOptions) => {
    if (this.callContract instanceof AElfContractBasic)
      return this.callContract.callSendMethod(functionName, paramsOption, sendOptions);

    // TODO WEB3 Contract
    return { data: '' };
  };
  public encodedTx: CallViewMethod = async (functionName, paramsOption) => {
    if (this.callContract instanceof AElfContractBasic) return this.callContract.encodedTx(functionName, paramsOption);

    // TODO WEB3 Contract
    return { data: '' };
  };
}

export class Web3ContractBasic {}

export class AElfContractBasic {
  public aelfContract: any;
  public address: string;
  public aelfInstance?: any;
  constructor(options: ContractProps) {
    const { aelfContract, contractAddress, aelfInstance } = options;
    this.address = contractAddress;
    this.aelfContract = aelfContract;
    this.aelfInstance = aelfInstance;
  }
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    const contract = this.aelfContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      const req = await contract[handleFunctionName(functionName)].call(paramsOption);
      if (!req?.error && (req?.result || req?.result === null)) return { data: req.result };
      return { data: req };
    } catch (error) {
      return { error: handleContractError(error) };
    }
  };

  public callSendMethod: AElfCallSendMethod = async (functionName, paramsOption, sendOptions) => {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error' } };
    try {
      const { onMethod = 'receipt' } = sendOptions || {};
      const _functionName = handleFunctionName(functionName);
      const _params = await handleContractParams({
        instance: this.aelfInstance,
        paramsOption,
        functionName: _functionName,
      });
      const req = await this.aelfContract[_functionName](_params);

      const { TransactionId } = req.result || req;
      if (req.error) return { error: handleContractError(undefined, req), transactionId: TransactionId };

      // receipt
      if (onMethod === 'receipt') {
        await sleep(1000);
        try {
          const txResult = await getTxResult(this.aelfInstance, TransactionId);
          return { data: txResult, transactionId: TransactionId };
        } catch (error) {
          return { error: handleContractError(error, req), transactionId: TransactionId };
        }
      }

      // transactionHash
      return { transactionId: TransactionId };
    } catch (error) {
      return { error: handleContractError(error) };
    }
  };

  public encodedTx: AElfCallViewMethod = async (functionName, paramsOption) => {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error' } };
    if (!this.aelfInstance) return { error: { code: 401, message: 'instance init error' } };
    try {
      const raw = await aelf.encodedTx({
        instance: this.aelfInstance,
        contract: this.aelfContract,
        functionName,
        paramsOption,
      });
      return raw;
    } catch (error) {
      return handleContractError(error);
    }
  };
}
