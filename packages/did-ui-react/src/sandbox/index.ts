import { SandboxEventTypes, SandboxEventService, SandboxErrorCode } from '../utils/sandboxService';
import { aelf } from '@portkey-v1/utils';
import { FetchRequest } from '@portkey-v1/request';
import { IEOAInstanceOptions, IPortkeyContract, getContractBasic } from '@portkey-v1/contracts';
import { getMissParams, handleErrorMessage } from '../utils/errorHandler';
import { COMMON_PRIVATE } from '../constants';
import { IContract } from '@portkey-v1/types';
import { ICustomViewOptions, IWalletCustomSendOptions } from '../utils/sandboxUtil/types';

type SendBack = (
  event: MessageEvent<any>,
  response?: {
    code: SandboxErrorCode;
    message?: any;
    sid: string;
    error?: any;
    transactionId?: string;
  },
) => void;
type RpcUrl = string;
type ContractAddress = string;
type CAFlag = string; // `${contractAddress}-${caHash}`
type FromAccountPrivateKey = string;
const contracts: Record<RpcUrl, Record<ContractAddress, IContract>> = {};
const accountContracts: Record<RpcUrl, Record<FromAccountPrivateKey, Record<ContractAddress, IPortkeyContract>>> = {};
const caContracts: Record<RpcUrl, Record<FromAccountPrivateKey, Record<CAFlag, IContract>>> = {};

class SandboxUtil {
  constructor() {
    this.listener();
  }

  static callback(
    event: MessageEvent<any>,
    response?: {
      code: SandboxErrorCode;
      message?: any;
      sid: string;
    },
  ) {
    SandboxEventService.dispatchToOrigin(event, response);
  }

  listener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('message', async function (event) {
      switch (event.data.event) {
        case SandboxEventTypes.callViewMethod:
          SandboxUtil.callViewMethod(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.callSendMethod:
          SandboxUtil.callSendMethod(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.callCASendMethod:
          SandboxUtil.callCASendMethod(event, SandboxUtil.callback);
          break;

        case SandboxEventTypes.getTransactionFee:
          SandboxUtil.getTransactionFee(event, SandboxUtil.callback);
          break;

        case SandboxEventTypes.getTransactionRaw:
          SandboxUtil.getTransactionRaw(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.callSendMethodFormat:
          SandboxUtil.callSendMethodFormat(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.callViewMethodFormat:
          SandboxUtil.callViewMethodFormat(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.encodedTx:
          SandboxUtil.encodedTx(event, SandboxUtil.callback);
          break;
        default:
          break;
      }
    });
  }

  static async _getELFViewContract(rpcUrl: string, address: string, privateKey: string = COMMON_PRIVATE) {
    let _contract = contracts?.[rpcUrl]?.[address];
    if (!_contract) {
      _contract = await getContractBasic({
        contractAddress: address,
        account: aelf.getWallet(privateKey),
        rpcUrl,
      });
      if (!contracts?.[rpcUrl]) contracts[rpcUrl] = {};
      contracts[rpcUrl][address] = _contract;
    }
    return _contract;
  }

  static async _getELFSendContract(rpcUrl: string, address: string, privateKey: string) {
    let _contract = accountContracts?.[rpcUrl]?.[privateKey]?.[address];
    if (!_contract) {
      _contract = await getContractBasic({
        contractAddress: address,
        account: aelf.getWallet(privateKey),
        rpcUrl,
      });
      if (!accountContracts?.[rpcUrl]) accountContracts[rpcUrl] = {};
      if (!accountContracts?.[rpcUrl]?.[privateKey]) accountContracts[rpcUrl][privateKey] = {};
      accountContracts[rpcUrl][privateKey][address] = _contract;
    }

    return _contract;
  }

  static async getCAContract({
    rpcUrl,
    privateKey,
    caContractAddress,
    contractAddress,
    caHash,
  }: {
    caHash: string;
    rpcUrl: string;
    privateKey: string;
    contractAddress: string;
    caContractAddress: string;
  }) {
    let _contract = caContracts?.[rpcUrl]?.[privateKey]?.[`${contractAddress}-${caHash}`];
    if (!_contract) {
      _contract = await getContractBasic({
        contractAddress,
        account: aelf.getWallet(privateKey),
        caContractAddress,
        callType: 'ca',
        caHash,
        rpcUrl,
      });
      if (!caContracts?.[rpcUrl]) caContracts[rpcUrl] = {};
      if (!caContracts?.[rpcUrl]?.[privateKey]) caContracts[rpcUrl][privateKey] = {};
      caContracts[rpcUrl][privateKey][`${contractAddress}-${caHash}`] = _contract;
    }

    return _contract;
  }

  static async callViewMethod(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};
    try {
      const { rpcUrl, address, methodName, paramsOption = '', chainType } = data;
      if (!rpcUrl || !address || !methodName) throw 'Invalid argument';
      // TODO only support aelf
      if (chainType !== 'aelf') throw 'Not support';

      const contract = await SandboxUtil._getELFViewContract(rpcUrl, address);
      const result = await contract?.callViewMethod(methodName, paramsOption);
      if (result.error) throw result.error;
      callback(event, {
        code: SandboxErrorCode.success,
        message: result.data,
        sid: data.sid,
      });
    } catch (error: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(error),
        sid: data.sid,
      });
    }
  }

  static async callCASendMethod(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};

    try {
      const {
        rpcUrl,
        contractAddress,
        methodName,
        privateKey,
        caContractAddress,
        caHash,
        paramsOption,
        chainType,
        sendOptions,
      } = data;
      const missParams = getMissParams({
        rpcUrl,
        contractAddress,
        methodName,
        caContractAddress,
      });
      if (missParams) throw `Miss Param: ${missParams}`;
      // TODO only support aelf
      if (chainType !== 'aelf') throw 'Not support';

      const contract = await SandboxUtil.getCAContract({
        contractAddress,
        privateKey,
        caContractAddress,
        caHash,
        rpcUrl,
      });
      const account = aelf.getWallet(privateKey);

      const req = await contract.callSendMethod(methodName, account, paramsOption, sendOptions);

      if (req?.error) throw req.error;
      return callback(event, {
        code: SandboxErrorCode.success,
        message: req?.data,
        sid: data.sid,
        transactionId: req.transactionId,
      });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(e),
        sid: data.sid,
      });
    }
  }

  static async callSendMethod(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};

    try {
      const { rpcUrl, address, methodName, privateKey, paramsOption, chainType, isGetSignTx = 0, sendOptions } = data;
      const missParams = getMissParams({
        rpcUrl,
        address,
        methodName,
      });
      if (missParams) throw `Miss Param: ${missParams}`;
      // TODO only support aelf
      if (chainType !== 'aelf') throw 'Not support';

      const account = aelf.getWallet(privateKey);
      const contract = await SandboxUtil._getELFSendContract(rpcUrl, address, privateKey);
      const contractMethod = !isGetSignTx ? contract?.callSendMethod : contract?.encodedTx;
      const req = await contractMethod?.(methodName, account, paramsOption, sendOptions);
      if (req?.error) throw req;
      return callback(event, { code: SandboxErrorCode.success, message: req?.data, sid: data.sid });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(e),
        sid: data.sid,
      });
    }
  }

  static async getTransactionRaw(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};
    try {
      const { rpcUrl, address, paramsOption, chainType, methodName, privateKey } = data;
      if (chainType !== 'aelf') throw 'Not support';
      const aelfContract = await SandboxUtil._getELFSendContract(rpcUrl, address, privateKey);
      const raw = await aelfContract.encodedTx(methodName, paramsOption);
      callback(event, {
        code: SandboxErrorCode.success,
        message: raw.data,
        sid: data.sid,
      });
    } catch (e) {
      return callback(event, {
        code: SandboxErrorCode.error,
        error: e,
        sid: data.sid,
      });
    }
  }

  static async getTransactionFee(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};
    try {
      const { rpcUrl, address, paramsOption, chainType, methodName, privateKey } = data;
      // TODO only support aelf
      if (chainType !== 'aelf') throw 'Not support';
      const aelfInstance = aelf.getAelfInstance(rpcUrl);
      const aelfContract = await SandboxUtil._getELFSendContract(rpcUrl, address, privateKey);
      const raw = await aelf.encodedTx({
        instance: aelfInstance,
        contract: aelfContract,
        functionName: methodName,
        paramsOption,
      });
      if (raw.error) throw raw.error;
      const customFetch = new FetchRequest({});

      const transaction: any = await customFetch.send({
        url: `${rpcUrl}/api/blockChain/calculateTransactionFee`,
        method: 'POST',
        params: {
          RawTransaction: raw,
        },
      });

      if (!transaction?.Success) throw 'Transaction failed';
      callback(event, {
        code: SandboxErrorCode.success,
        message: transaction,
        sid: data.sid,
      });
    } catch (e) {
      return callback(event, {
        code: SandboxErrorCode.error,
        error: e,
        sid: data.sid,
      });
    }
  }

  static async callSendMethodFormat(
    event: MessageEvent<{ data: IWalletCustomSendOptions & { sid: string } }>,
    callback: SendBack,
  ) {
    const data = event.data.data ?? {};

    try {
      const { contractOptions, functionName, privateKey, paramsOption, sendOptions } = data;

      const missParams = getMissParams({
        functionName,
        contractOptions,
        privateKey,
      });

      if (missParams) throw `Miss Param: ${missParams}`;
      const account = aelf.getWallet(privateKey);
      (contractOptions as IEOAInstanceOptions).account = account;
      const contract = await getContractBasic(contractOptions as any);
      const req = await contract.callSendMethod(functionName, account.address, paramsOption, sendOptions);

      return callback(event, { code: SandboxErrorCode.success, message: req, sid: data.sid });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(e),
        sid: data.sid,
      });
    }
  }

  static async callViewMethodFormat(
    event: MessageEvent<{ data: ICustomViewOptions & { sid: string } }>,
    callback: SendBack,
  ) {
    const data = event.data.data ?? {};

    try {
      const { contractOptions, functionName, paramsOption, callOptions } = data;
      const missParams = getMissParams({
        functionName,
        contractOptions,
      });

      if (missParams) throw `Miss Param: ${missParams}`;
      const account = aelf.getWallet(COMMON_PRIVATE);
      (contractOptions as IEOAInstanceOptions).account = account;
      const contract = await getContractBasic(contractOptions as any);
      const req = await contract.callViewMethod(functionName, paramsOption, callOptions);
      return callback(event, { code: SandboxErrorCode.success, message: req, sid: data.sid });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(e),
        sid: data.sid,
      });
    }
  }

  static async encodedTx(
    event: MessageEvent<{ data: Omit<IWalletCustomSendOptions, 'sendOptions'> & { sid: string } }>,
    callback: SendBack,
  ) {
    const data = event.data.data ?? {};

    try {
      const { contractOptions, functionName, privateKey, paramsOption } = data;

      const missParams = getMissParams({
        functionName,
        contractOptions,
      });

      if (missParams) throw Error(`Miss Param: ${missParams}`);
      const account = aelf.getWallet(privateKey);
      (contractOptions as IEOAInstanceOptions).account = account;
      const contract = await getContractBasic(contractOptions as any);
      const result = await contract.encodedTx(functionName, paramsOption);
      console.log(result, 'result===');
      return callback(event, { code: SandboxErrorCode.success, message: result, sid: data.sid });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        error: handleErrorMessage(e),
        sid: data.sid,
      });
    }
  }
}

new SandboxUtil();
