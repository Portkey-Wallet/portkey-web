import { ContractBasic } from '../contract';
import AElf from 'aelf-sdk';
import { IBlockchainWallet } from '@portkey/types';
import { sleep } from '@portkey/utils';
import { aelf } from '@portkey/utils';

const methodsMap: { [key: string]: any } = {};

export async function getContractBasic({
  contractAddress,
  aelfInstance,
  account,
  rpcUrl,
}: {
  rpcUrl?: string;
  contractAddress: string;
  aelfInstance?: any;
  account: { address: string } | IBlockchainWallet;
}) {
  let instance = aelfInstance;
  if (rpcUrl) instance = aelf.getAelfInstance(rpcUrl);
  if (!instance) throw new Error('Get instance error');
  const aelfContract = await instance.chain.contractAt(contractAddress, account);
  return new ContractBasic({
    type: 'aelf',
    aelfContract,
    contractAddress,
    aelfInstance: instance,
    rpcUrl: instance.currentProvider.host,
  });
}

export async function getTxResult(
  instance: any,
  TransactionId: string,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<any> {
  const txFun = instance.chain.getTxResult;
  const txResult = await txFun(TransactionId);
  if (txResult.error && txResult.errorMessage) {
    throw Error(txResult.errorMessage.message || txResult.errorMessage.Message);
  }
  const result = txResult?.result || txResult;

  if (!result) {
    throw Error('Can not get transaction result.');
  }
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

  if (lowerCaseStatus === 'mined') {
    return result;
  }

  throw Error(result.Error || `Transaction: ${result.Status}`);
}

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error.Error) {
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

export async function getContractMethods(instance: any, address: any) {
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

type HandleContractParamsParams = { paramsOption: any; functionName: string; instance: any };

export const handleManagerForwardCall = async ({ paramsOption, instance }: HandleContractParamsParams) => {
  const { contractAddress, methodName, args, caHash } = paramsOption || {};
  if (!(contractAddress && methodName && caHash)) {
    throw new Error('ManagerForwardCall parameter is missing');
  }
  const methods = await getContractMethods(instance, paramsOption.contractAddress);
  const inputType = methods[paramsOption.methodName];
  if (!inputType) throw new Error(`Contract ${contractAddress} does not exist ${methodName}`);
  const params: any = {
    caHash,
    contractAddress,
    methodName,
  };
  if (args) params.args = await encodedParams(inputType, args);
  return params;
};

export const handleContractParams = async (params: HandleContractParamsParams) => {
  const { paramsOption, functionName } = params;
  if (functionName === 'ManagerForwardCall') return handleManagerForwardCall(params);
  return paramsOption;
};
