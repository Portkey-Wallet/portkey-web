import { ContractBasic } from '@portkey/contracts';
import { ChainType, ICallViewMethod, ICallSendMethod } from '@portkey/types';
import { CustomContractBasic } from './CustomContractBasic';

export interface ICommonContractOption {
  rpcUrl: string;
  contractAddress: string;
  privateKey?: string;
  callContract?: any;
  sandboxId?: string;
}

export class CommonContractBasic extends ContractBasic {
  public address: string;
  public chainType: ChainType;
  public rpcUrl: string;
  public callContract: any;
  public sandboxId?: string;

  public privateKey?: string;

  constructor(options: ICommonContractOption) {
    super(options as any);
    this.address = options.contractAddress;
    this.rpcUrl = options.rpcUrl;
    this.privateKey = options.privateKey;
    const isELF = true;
    this.chainType = isELF ? 'aelf' : 'ethereum';
    this.sandboxId = options.sandboxId;
  }

  public callViewMethod: ICallViewMethod = async (
    functionName,
    paramsOption,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callOptions = { defaultBlock: 'latest' },
  ) => {
    return CustomContractBasic.callViewMethod({
      contractOptions: {
        rpcUrl: this.rpcUrl,
        contractAddress: this.address,
      },
      functionName,
      paramsOption,
      sandboxId: this.sandboxId,
    });
  };

  public callSendMethod: ICallSendMethod = async (functionName, _account, paramsOption, sendOptions) => {
    if (!this.privateKey) throw Error('The contract callSendMethod method lacks user information');
    return CustomContractBasic.callSendMethod({
      sandboxId: this.sandboxId,
      privateKey: this.privateKey,
      contractOptions: {
        rpcUrl: this.rpcUrl,
        contractAddress: this.address,
      },
      functionName,
      paramsOption,
      sendOptions,
    });
  };

  public encodedTx: ICallViewMethod = async (functionName, paramsOption) => {
    if (!this.privateKey) throw Error('The contract encodedTx method lacks user information');

    return CustomContractBasic.encodedTx({
      sandboxId: this.sandboxId,
      contractOptions: {
        rpcUrl: this.rpcUrl,
        contractAddress: this.address,
      },
      functionName,
      paramsOption,
      privateKey: this.privateKey,
    });
  };

  public calculateTransactionFee: ICallViewMethod = async (functionName, paramsOption) => {
    if (!this.privateKey) throw Error('The contract encodedTx method lacks user information');

    return CustomContractBasic.getTransactionFee({
      sandboxId: this.sandboxId,
      contractOptions: {
        rpcUrl: this.rpcUrl,
        contractAddress: this.address,
      },
      functionName,
      paramsOption,
      privateKey: this.privateKey,
    });
  };
}

// Example

// const contract = new CommonContractBasic({
//   rpcUrl: 'rpcUrl',
//   contractAddress: 'contractAddress',
//   privateKey: 'privateKey',
// });

// contract;

// contract.callSendMethod();
// contract.callViewMethod();
// contract.calculateTransactionFee();
// contract.encodedTx();
