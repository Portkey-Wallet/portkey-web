import { getContractBasic } from '@portkey/contracts';
import { IEBridgeELFChainInfo, IEBridgeEVMChainInfo } from '../types';
import { getEVMContract, getHttpProvider } from './evm';
import { BRIDGE_IN_ABI } from '../abis';
import { IBridgeOperator, ICheckAndApproveParams, ICreateReceiptHandlerParams } from '../types/bridge';
import { LIMIT_ABI } from '../abis';
import { WB3ContractBasic } from './web3Contract';
import Web3 from 'web3';
import { ChainId, IContract } from '@portkey/types';
import { getChainIdByMap, getReceiptLimit } from '.';
import type { Contract } from 'web3-eth-contract';
import { divDecimals, timesDecimals, ZERO } from '@etransfer/utils';
import { VIEW_PRIVATE } from '../../../constants/eBridge';
import { aelf } from '@portkey/utils';
import { CustomContractBasic } from '../../sandboxUtil/CustomContractBasic';
import { getChain } from '../../../hooks';
import { callCASendMethod } from '../../sandboxUtil/callCASendMethod';

// import { divDecimals, timesDecimals } from '../../converter';

export const ELF_NATIVE_TOKEN = 'ELF';

export class EVMBridgeOperator implements IBridgeOperator {
  public chainInfo: IEBridgeEVMChainInfo;
  constructor(chainInfo: IEBridgeEVMChainInfo) {
    this.chainInfo = chainInfo;
  }
  checkAllowanceAndApprove(params: ICheckAndApproveParams): Promise<boolean> {
    console.log('checkAllowanceAndApprove', params);
    throw new Error('Method not implemented.');
  }
  createReceipt(params: ICreateReceiptHandlerParams): Promise<any> {
    console.log('createReceipt', params);
    throw new Error('Method not implemented.');
  }

  public getBridgeContract = () => {
    const contract = getEVMContract(this.chainInfo.rpcUrl, BRIDGE_IN_ABI as any, this.chainInfo.bridgeContract);
    const web3 = new Web3(getHttpProvider(this.chainInfo.rpcUrl));
    return new WB3ContractBasic({ web3, contract: contract as unknown as Contract });
  };
  public getLimitOutContract = () => {
    const contract = getEVMContract(this.chainInfo.rpcUrl, LIMIT_ABI as any, this.chainInfo.limitContract);
    const web3 = new Web3(getHttpProvider(this.chainInfo.rpcUrl));
    return new WB3ContractBasic({ web3, contract: contract as unknown as Contract });
  };

  getFromLimit = async (toChainId: string, target: string) => {
    const limitContract = this.getLimitOutContract();
    const limit = await getReceiptLimit({
      type: 'evm',
      limitContract: limitContract as unknown as IContract,
      target,
      toChainId: toChainId as ChainId,
    });
    return limit;
  };
  getToLimit = async (toChainId: string, target: string) => {
    const limitContract = this.getLimitOutContract();
    const limit = await getReceiptLimit({
      type: 'evm',
      limitContract: limitContract as unknown as IContract,
      target,
      toChainId: toChainId as ChainId,
    });
    return limit;
  };
}

export class ELFBridgeOperator implements IBridgeOperator {
  public chainInfo: IEBridgeELFChainInfo;
  constructor(chainInfo: IEBridgeELFChainInfo) {
    this.chainInfo = chainInfo;
  }

  public getBridgeContract = () => {
    return getContractBasic({
      account: aelf.getWallet(VIEW_PRIVATE),
      rpcUrl: this.chainInfo.rpcUrl,
      contractAddress: this.chainInfo.bridgeContract,
    });
  };

  getFromLimit = async (toChainId: string, target: string) => {
    const bridgeContract = await this.getBridgeContract();
    const limit = await getReceiptLimit({
      type: 'aelf',
      limitContract: bridgeContract as unknown as IContract,
      target,
      toChainId: toChainId as ChainId,
    });
    return limit;
  };

  getELFFee = async (toChainId: string) => {
    const bridgeContract = await this.getBridgeContract();
    const ELFFee = await bridgeContract.callViewMethod('GetFeeByChainId', {
      value: toChainId,
    });
    return ELFFee.data.value;
  };
  getToLimit = async (toChainId: string, target: string) => {
    const bridgeContract = await this.getBridgeContract();
    const limit = await getReceiptLimit({
      type: 'aelf',
      limitContract: bridgeContract as unknown as IContract,
      target,
      toChainId: toChainId as ChainId,
    });
    return limit;
  };

  checkAllowanceAndApprove = async ({
    chainId,
    tokenContractAddress,
    portkeyContractAddress,
    symbol,
    spender,
    owner,
    amount,
    caHash,
    privateKey,
  }: ICheckAndApproveParams) => {
    const chainInfo = await getChain(chainId);
    if (!chainInfo) throw 'Please check network connection and chainId';

    const [allowance, info] = await Promise.all([
      CustomContractBasic.callViewMethod({
        contractOptions: {
          rpcUrl: chainInfo?.endPoint,
          contractAddress: tokenContractAddress,
        },
        functionName: 'GetAllowance',
        paramsOption: {
          symbol,
          owner,
          spender,
        },
      }),

      CustomContractBasic.callViewMethod({
        contractOptions: {
          rpcUrl: chainInfo?.endPoint,
          contractAddress: tokenContractAddress,
        },
        functionName: 'GetTokenInfo',
        paramsOption: {
          symbol,
        },
      }),
    ]);
    if (allowance?.error) throw allowance?.error;
    if (info?.error) throw info?.error;
    const allowanceBN = ZERO.plus(allowance.data.allowance ?? allowance.data.amount ?? 0);
    const pivotBalanceBN = timesDecimals(amount, info.data.decimals ?? 8);
    if (allowanceBN.lt(pivotBalanceBN)) {
      const approveResult = await callCASendMethod({
        methodName: 'ManagerApprove',
        paramsOption: {
          caHash,
          spender,
          symbol,
          amount: pivotBalanceBN.toFixed(),
        },
        chainId,
        caHash,
        chainType: 'aelf',
        // Check it
        contractAddress: portkeyContractAddress,
        privateKey,
      });
      if (approveResult?.error) throw approveResult?.error;
      return true;
    }
    return true;
  };

  async createReceipt(params: ICreateReceiptHandlerParams): Promise<any> {
    const {
      amount,
      tokenContractAddress,
      portkeyContractAddress,
      owner,
      caHash,
      tokenInfo,
      targetChainId,
      targetAddress,
      privateKey,
      chainId,
    } = params;
    const symbol = tokenInfo.symbol;
    const approveParams = {
      tokenContractAddress,
      portkeyContractAddress,
      symbol,
      spender: this.chainInfo.bridgeContract,
      owner,
      amount,
      caHash,
      privateKey,
      chainId,
    };
    const toBridgeChainId = getChainIdByMap(String(targetChainId));

    const ELFFee = await this.getELFFee(toBridgeChainId);
    const ELFFeeAmount = divDecimals(ELFFee, 8).toFixed(0);
    console.log(ELFFee);
    if (symbol !== ELF_NATIVE_TOKEN) {
      await this.checkAllowanceAndApprove({
        ...approveParams,
        amount: ELFFeeAmount,
        symbol: ELF_NATIVE_TOKEN,
      });
    }

    if (symbol === ELF_NATIVE_TOKEN) {
      approveParams.amount = ZERO.plus(amount).plus(ELFFeeAmount).toFixed(0);
      approveParams.symbol = tokenInfo.symbol;
    }
    await this.checkAllowanceAndApprove({
      ...approveParams,
    });

    return callCASendMethod({
      methodName: 'CreateReceipt',
      chainId,
      caHash,
      chainType: 'aelf', // TODO: change it
      contractAddress: this.chainInfo.bridgeContract,
      privateKey,
      paramsOption: {
        symbol,
        owner,
        targetAddress,
        amount: timesDecimals(amount, tokenInfo.decimals ?? 8).toFixed(0),
        targetChainId: getChainIdByMap(targetChainId),
      },
    });

    // return portkeyContract.callSendMethod('ManagerForwardCall', '', {
    //   caHash,
    //   contractAddress: ,
    //   methodName: 'CreateReceipt',
    //   args: {
    //     symbol,
    //     owner,
    //     targetAddress,
    //     amount: timesDecimals(amount, tokenInfo.decimals ?? 8).toFixed(0),
    //     targetChainId: getChainIdByMap(targetChainId),
    //   },
    // });
  }
}
