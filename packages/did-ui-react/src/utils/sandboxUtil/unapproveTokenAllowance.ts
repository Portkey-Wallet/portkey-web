import { ChainId } from '@portkey/types';
import { CustomContractBasic, did } from '..';
import { getChainInfo } from '../../hooks/useChainInfo';

export const unapproveTokenAllowance = async ({
  targetChainId,
  contractAddress,
  allownance,
}: {
  targetChainId?: ChainId;
  contractAddress: string;
  allownance: number;
}) => {
  const chainInfo = await getChainInfo(targetChainId);
  const res = await CustomContractBasic.callSendMethod({
    privateKey: did?.didWallet?.managementAccount?.privateKey || '',
    contractOptions: {
      rpcUrl: chainInfo?.endPoint,
      contractAddress: chainInfo?.caContractAddress || '',
    },
    functionName: 'Unapprove',
    paramsOption: {
      symbol: '*',
      spender: contractAddress,
      allownance,
    },
  });
  console.log('===unapproveTokenAllowance result', res);
};
