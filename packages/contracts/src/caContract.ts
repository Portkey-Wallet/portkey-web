import { IContract, SendOptions, SendResult } from '@portkey/types';
import { sleep } from '@portkey/utils';

import { AElfContract } from './aelfContract';
import { CAContractProps } from './types';
import { getTxResult, handleContractError, handleContractParams, handleFunctionName } from './utils';

export class AElfCAContract extends AElfContract implements IContract {
  public caContractAddress: string;
  public caContract: any;
  public caHash: string;
  constructor(options: CAContractProps) {
    super(options);
    this.caContractAddress = options.caContractAddress;
    this.caContract = options.caContract;
    this.caHash = options.caHash;
  }

  public async callSendMethod<T = any>(
    functionName: string,
    _account: string,
    paramsOption?: any,
    sendOptions?: SendOptions | undefined,
  ): Promise<SendResult<T>> {
    if (!this.caContract) return { error: { code: 401, message: 'Contract init error' } };
    try {
      const { onMethod = 'receipt' } = sendOptions || {};

      let _params: any, _functionName: string;
      if (this.address !== this.caContractAddress) {
        _functionName = 'ManagerForwardCall';
        const methodName = handleFunctionName(functionName);
        _params = await handleContractParams({
          instance: this.aelfInstance,
          paramsOption: {
            args: paramsOption,
            caHash: this.caHash,
            methodName,
            contractAddress: this.address,
          },
          functionName: _functionName,
        });
      } else {
        _functionName = handleFunctionName(functionName);
        _params = await handleContractParams({
          instance: this.aelfInstance,
          paramsOption,
          functionName: _functionName,
        });
      }

      const req = await this.caContract[_functionName](_params);

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
  }
}
