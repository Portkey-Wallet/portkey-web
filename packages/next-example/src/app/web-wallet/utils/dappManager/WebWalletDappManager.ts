import { ChainId } from '@portkey/types';
import { DappManager } from './index';
import { ApproveMethod } from '../../constants/dapp';

export class WebWalletDappManager extends DappManager {
  constructor(options: { appId: string }) {
    super(options);
  }

  isApprove = async (payload: { contractAddress: string; method: string; chainId: ChainId }) => {
    const { contractAddress, method: contractMethod, chainId } = payload || {};
    const chainInfo = await this.getChainInfo(chainId);
    return (
      (contractAddress === chainInfo?.defaultToken.address && contractMethod === ApproveMethod.token) ||
      (contractAddress === chainInfo?.caContractAddress && contractMethod === ApproveMethod.ca)
    );
  };
}
