import AElf from 'aelf-sdk';
import { sleep } from '@portkey/utils';
import { aelf } from '@portkey/utils';
import { AElfWallet, TransactionResult } from '@portkey/types';

import {
  IGetContract,
  IEOAInstanceOptions,
  IPortkeyContract,
  IProviderOptions,
  ICAInstanceOptions,
  ContractProps,
} from '../types';
import { AElfCAContract } from '../caContract';
import { ContractBasic } from '../contract';

const methodsMap: { [key: string]: any } = {};

export const getContractBasic: IGetContract['getContractBasic'] = async (
  options: IProviderOptions | IEOAInstanceOptions | ICAInstanceOptions,
) => {
  const { contractAddress, chainType = 'aelf', callType = 'eoa' } = options;

  if (chainType === 'ethereum') throw new Error('Not yet supported');

  // use provider
  if ('chainProvider' in options) {
    const { chainProvider } = options;
    return chainProvider.getContract(contractAddress) as IPortkeyContract;
  }

  const { aelfInstance, rpcUrl, account } = options;
  let instance = aelfInstance;
  if (rpcUrl) instance = aelf.getAelfInstance(rpcUrl);
  if (!instance) throw new Error('Get instance error');

  const contractOptions: ContractProps = {
    type: chainType,
    contractAddress,
    aelfInstance: instance,
    rpcUrl: (instance as any)?.currentProvider?.host || 'host',
  };

  // use ca contract
  if (callType === 'ca') {
    const { caContractAddress, caHash } = options as ICAInstanceOptions;
    const [aelfContract, caContract] = await Promise.all([
      instance.chain.contractAt(contractAddress, account as AElfWallet),
      instance.chain.contractAt(caContractAddress, account as AElfWallet),
    ]);
    return new AElfCAContract({
      ...contractOptions,
      caHash,
      caContract,
      aelfContract,
      caContractAddress,
    });
  }
  const aelfContract = await instance.chain.contractAt(contractAddress, account as AElfWallet);

  // use basic contract
  return new ContractBasic({ ...contractOptions, aelfContract });
};

export function handleGetTxResult(instance: any) {
  return instance.getTxResult ? instance.getTxResult : instance.chain.getTxResult;
}

export async function getTxResult(
  instance: any,
  TransactionId: string,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<TransactionResult> {
  const txFun = handleGetTxResult(instance);

  const txResult = await txFun(TransactionId);
  if (txResult.error && txResult.errorMessage)
    throw Error(txResult.errorMessage.message || txResult.errorMessage.Message);

  const result = txResult?.result || txResult;

  if (!result) throw Error('Can not get transaction result.');

  const lowerCaseStatus = result.Status.toLowerCase();

  if (lowerCaseStatus === 'notexisted') {
    if (notExistedReGetCount > 5) return result;
    await sleep(1000);
    notExistedReGetCount++;
    reGetCount++;
    return getTxResult(instance, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'pending' || lowerCaseStatus === 'pending_validation') {
    if (reGetCount > 20) return result;
    await sleep(1000);
    reGetCount++;
    return getTxResult(instance, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'mined') return result;
  throw Error(result.Error || `Transaction: ${result.Status}`);
}

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error?.Error) {
    return {
      message: error.Error.Details || error.Error.Message || error.Error || error.Status,
      code: error.Error.Code,
    };
  }
  return {
    code: req?.error?.message?.Code || req?.error,
    message: req?.errorMessage?.message || req?.error?.message?.Message,
  };
}

export function handleFunctionName(functionName: string) {
  return functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
}

export const getServicesFromFileDescriptors = (descriptors: any) => {
  const root = AElf.pbjs.Root.fromDescriptor(descriptors, 'proto3').resolveAll();
  return descriptors.file
    .filter((f: { service: string | any[] }) => f.service.length > 0)
    .map((f: { service: { name: any }[]; package: any }) => {
      const sn = f.service[0].name;
      const fullName = f.package ? `${f.package}.${sn}` : sn;
      return root.lookupService(fullName);
    });
};

export const getFileDescriptorsSet = async (instance: any, contractAddress: string) => {
  const fds = await instance.chain.getContractFileDescriptorSet(contractAddress);
  return getServicesFromFileDescriptors(fds);
};

export async function getContractMethods(instance: any, address: string) {
  const key = instance.currentProvider.host + address;
  if (!methodsMap[key]) {
    const methods = await getFileDescriptorsSet(instance, address);
    const _obj: any = {};
    Object.keys(methods).forEach(key => {
      const service = methods[key];
      Object.keys(service.methods).forEach(key => {
        const method = service.methods[key].resolve();
        _obj[method.name] = method.resolvedRequestType;
      });
    });
    methodsMap[key] = _obj;
  }
  return methodsMap[key];
}

export const encodedParams = async (inputType: any, params: any) => {
  let input = AElf.utils.transform.transformMapToArray(inputType, params);

  input = AElf.utils.transform.transform(inputType, input, AElf.utils.transform.INPUT_TRANSFORMERS);

  const message = inputType.fromObject(input);
  return inputType.encode(message).finish();
};

export type HandleContractParamsParams = {
  paramsOption: {
    contractAddress: string;
    methodName: string;
    args: any;
    caHash: string;
  };
  functionName: string;
  instance: any;
};

export const handleManagerForwardCall = async ({ paramsOption, instance }: HandleContractParamsParams) => {
  const { contractAddress, methodName, args, caHash } = paramsOption || {};
  if (!(contractAddress && methodName && caHash)) {
    throw new Error('ManagerForwardCall parameter is missing');
  }
  const methods = await getContractMethods(instance, paramsOption.contractAddress);
  const inputType = methods[paramsOption.methodName];
  if (!inputType) throw new Error(`Contract ${contractAddress} does not exist ${methodName}`);
  const params = { ...paramsOption };
  if (args) params.args = await encodedParams(inputType, args);
  return params;
};

export const handleContractParams = async (params: HandleContractParamsParams) => {
  const { paramsOption, functionName } = params;
  if (functionName === 'ManagerForwardCall') return handleManagerForwardCall(params);
  return paramsOption;
};

type TCreateManagerForwardCallParams = {
  paramsOption: {
    contractAddress: string;
    methodName: string;
    args: any;
    caHash: string;
  };
  caContractAddress: string;
  instance?: any;
  rpcUrl?: string;
};
export const createManagerForwardCall = async ({
  rpcUrl,
  instance,
  paramsOption,
  caContractAddress,
}: TCreateManagerForwardCallParams) => {
  const ManagerForwardCall = 'ManagerForwardCall';
  let _instance;
  if (rpcUrl) _instance = aelf.getAelfInstance(rpcUrl);
  if (instance) _instance = instance;
  if (!_instance) throw new Error('Please pass in instance or rpcUrl');
  const [managerForwardCall, caMethods] = await Promise.all([
    handleManagerForwardCall({
      instance,
      functionName: ManagerForwardCall,
      paramsOption,
    }),
    getContractMethods(instance, caContractAddress),
  ]);
  const managerForwardCallInputType = caMethods[ManagerForwardCall];
  let input = AElf.utils.transform.transformMapToArray(managerForwardCallInputType, managerForwardCall);

  input = AElf.utils.transform.transform(managerForwardCallInputType, input, AElf.utils.transform.INPUT_TRANSFORMERS);

  const message = managerForwardCallInputType.fromObject(input);

  return AElf.utils.uint8ArrayToHex(managerForwardCallInputType.encode(message).finish()) as string;
};
