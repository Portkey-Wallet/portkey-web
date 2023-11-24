import { isExtension } from '../lib';
import { ContractByWeb } from './ContractByWeb';
import { ICustomEncodeTxOptions, ICustomSendOptions, ICustomViewOptions } from './types';
import { PortkeyUIError } from '../../constants/error';
import { ContractBySandbox } from './ContractBySandbox';
import { aelf } from '@portkey/utils';
import { IEOAInstanceOptions, IProviderOptions } from '@portkey/contracts';
import { COMMON_PRIVATE } from '../../constants';
import { FetchRequest } from '@portkey/request';

export class CustomContractBasic {
  static callSendMethod<P = any, R = any>(params: ICustomSendOptions<P>) {
    const { sandboxId, contractOptions, functionName, paramsOption, sendOptions } = params;
    const privateKey = (params as any)?.privateKey;
    if (isExtension()) {
      if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
      return ContractBySandbox.callSendMethod({
        sandboxId,
        privateKey,
        contractOptions,
        functionName,
        paramsOption,
        sendOptions,
      });
    }

    if (privateKey) (contractOptions as IEOAInstanceOptions).account = aelf.getWallet(privateKey);
    return ContractByWeb.callSendMethod<P, R>(contractOptions, functionName, '', paramsOption, sendOptions);
  }

  static callViewMethod<P = any, R = any>(params: ICustomViewOptions<P>) {
    const { sandboxId, contractOptions, functionName, paramsOption, callOptions } = params;
    if (isExtension()) {
      if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
      return ContractBySandbox.callViewMethod({
        sandboxId,
        contractOptions,
        functionName,
        paramsOption,
        callOptions,
      });
    }

    if (!(contractOptions as IProviderOptions)?.chainProvider)
      (contractOptions as IEOAInstanceOptions).account = aelf.getWallet(COMMON_PRIVATE);

    return ContractByWeb.callViewMethod<P, R>(contractOptions, functionName, paramsOption, callOptions);
  }
  static encodedTx<P = any, R = any>(params: ICustomEncodeTxOptions<P>) {
    const { sandboxId, contractOptions, functionName, paramsOption } = params;
    const privateKey = (params as any)?.privateKey;

    if (isExtension()) {
      if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
      return ContractBySandbox.encodedTx<P, R>(params);
    }
    if (privateKey) (contractOptions as IEOAInstanceOptions).account = aelf.getWallet(privateKey);
    return ContractByWeb.encodedTx<P, R>(contractOptions, functionName, paramsOption);
  }

  static async getTransactionFee<P = any>(params: ICustomEncodeTxOptions<P>) {
    const rawRes = await CustomContractBasic.encodedTx(params);
    const customFetch = new FetchRequest({});

    const transaction = await customFetch.send({
      url: `${params.contractOptions.rpcUrl}/api/blockChain/calculateTransactionFee`,
      method: 'POST',
      params: {
        RawTransaction: rawRes.data,
      },
    });
    if (!transaction?.Success) throw 'Transaction failed';

    return transaction.TransactionFee;
  }
}
