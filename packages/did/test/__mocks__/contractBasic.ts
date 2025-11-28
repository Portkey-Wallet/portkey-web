import { ContractProps, IPortkeyContract } from '@portkey/contracts';

export class ContractBasicMock {
  public address?: string;
  public callContract: IPortkeyContract;
  public chainType: 'aelf' | 'ethereum';
  public rpcUrl: string;
  constructor(_options: ContractProps) {
    this.chainType = 'aelf';
    this.address = _options.contractAddress;
    this.rpcUrl = _options.rpcUrl;
  }

  public callViewMethod: IPortkeyContract['callViewMethod'] = async (
    functionName,
    _paramsOption,
    _callOptions = { defaultBlock: 'latest' },
  ) => {
    let result;
    switch (functionName) {
      case 'GetVerifierServers':
        result = {
          data: {
            verifierServers: [
              {
                id: 'id_mock',
                name: 'name_mock',
                imageUrl: 'imageUrl_mock',
                endPoints: ['endPoints_mock'],
                verifierAddresses: ['verifierAddresses_mock'],
              },
            ],
          },
        };
        break;
      case 'GetHolderInfo':
        result = {
          data: {
            managerInfos: [
              {
                address: 'mock_management_Address',
              },
            ],
          },
        };
        break;
      default:
        result = { data: true };
        break;
    }

    return result;
  };

  public callSendMethod = async (functionName, _account, _paramsOption, _sendOptions) => {
    switch (functionName) {
      case 'AddManager':
      default:
        break;
    }
    return { data: true, transactionId: '' };
  };
  public encodedTx = async (_functionName, _paramsOption) => {
    return { data: true };
  };
}

export default ContractBasicMock;
