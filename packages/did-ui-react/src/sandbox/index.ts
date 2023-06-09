import { SandboxEventTypes, SandboxEventService, SandboxErrorCode } from '../utils/sandboxService';
import { aelf } from '@portkey/utils';
import { FetchRequest } from '@portkey/request';
import { ContractBasic, getContractBasic } from '@portkey/contracts';
import { getMissParams, handleErrorMessage } from '../utils/errorHandler';
import { COMMON_PRIVATE } from '../constants';

type SendBack = (
  event: MessageEvent<any>,
  response?: {
    code: SandboxErrorCode;
    message?: any;
    sid: string;
    error?: any;
  },
) => void;
type RpcUrl = string;
type ContractAddress = string;
type FromAccountPrivateKey = string;
const contracts: Record<RpcUrl, Record<ContractAddress, ContractBasic>> = {};
const accountContracts: Record<RpcUrl, Record<FromAccountPrivateKey, Record<ContractAddress, ContractBasic>>> = {};

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
    window.addEventListener('message', async function (event) {
      switch (event.data.event) {
        case SandboxEventTypes.callViewMethod:
          SandboxUtil.callViewMethod(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.callSendMethod:
          SandboxUtil.callSendMethod(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.getTransactionFee:
          SandboxUtil.getTransactionFee(event, SandboxUtil.callback);
          break;
        case SandboxEventTypes.initViewContract:
          SandboxUtil.initViewContract(event, SandboxUtil.callback);
          break;
        default:
          break;
      }
    });
  }

  static async initViewContract(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};
    try {
      const { rpcUrl, address, chainType } = data;
      // TODO only support aelf
      if (chainType !== 'aelf') {
        return callback(event, {
          code: SandboxErrorCode.error,
          message: 'Not support',
          sid: data.sid,
        });
      }
      await SandboxUtil._getELFViewContract(rpcUrl, address);
      return callback(event, {
        code: SandboxErrorCode.error,
        message: 'Not Support',
        sid: data.sid,
      });
    } catch (error) {
      console.log(error, 'initViewContract===error');
    }
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

  static async callViewMethod(event: MessageEvent<any>, callback: SendBack) {
    const data = event.data.data ?? {};
    try {
      const { rpcUrl, address, methodName, paramsOption = '', chainType } = data;
      if (!rpcUrl || !address || !methodName)
        return callback(event, {
          code: SandboxErrorCode.error,
          message: 'Invalid argument',
          sid: data.sid,
        });
      // TODO only support aelf
      if (chainType !== 'aelf') {
        return callback(event, {
          code: SandboxErrorCode.error,
          message: 'Not support',
          sid: data.sid,
        });
      }
      const contract = await SandboxUtil._getELFViewContract(rpcUrl, address);
      const result = await contract?.callViewMethod(methodName, paramsOption);
      if (result.error)
        return callback(event, {
          code: SandboxErrorCode.error,
          error: result.error,
          sid: data.sid,
        });
      callback(event, {
        code: SandboxErrorCode.success,
        message: result.data,
        sid: data.sid,
      });
    } catch (error: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        message: error?.error || error,
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
      if (missParams)
        return callback(event, {
          code: SandboxErrorCode.error,
          message: `Miss Param: ${missParams}`,
          sid: data.sid,
        });
      // TODO only support aelf
      if (chainType !== 'aelf') {
        return callback(event, {
          code: SandboxErrorCode.error,
          message: 'Not support',
          sid: data.sid,
        });
      }
      const account = aelf.getWallet(privateKey);
      const contract = await SandboxUtil._getELFSendContract(rpcUrl, address, privateKey);
      const contractMethod = !isGetSignTx ? contract?.callSendMethod : contract?.encodedTx;
      const req = await contractMethod?.(methodName, account, paramsOption, sendOptions);
      if (req?.error)
        return callback(event, {
          code: SandboxErrorCode.error,
          message: req.error?.message,
          sid: data.sid,
          error: req.error,
        });
      return callback(event, { code: SandboxErrorCode.success, message: req?.data, sid: data.sid });
    } catch (e: any) {
      callback(event, {
        code: SandboxErrorCode.error,
        message: handleErrorMessage(e),
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
        message: transaction.TransactionFee,
        sid: data.sid,
      });
    } catch (e) {
      return callback(event, {
        code: SandboxErrorCode.error,
        message: e,
        sid: data.sid,
      });
    }
  }
}

new SandboxUtil();
