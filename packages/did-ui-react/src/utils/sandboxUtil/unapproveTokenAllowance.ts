import { ChainId } from '@portkey/types';
import { did } from '..';
import { getContractBasic } from '@portkey/contracts';
import { getChainInfo } from '../../hooks/useChainInfo';
import { aelf } from '@portkey/utils';

export const unapproveTokenAllowance = async ({
  caHash,
  targetChainId,
  contractAddress,
  amount,
}: {
  caHash: string;
  targetChainId?: ChainId;
  contractAddress: string;
  amount: number;
}) => {
  const chainInfo = await getChainInfo(targetChainId);
  const contract = await getContractBasic({
    contractAddress: chainInfo.caContractAddress,
    account: aelf.getWallet(did?.didWallet?.managementAccount?.privateKey || ''),
    rpcUrl: chainInfo?.endPoint,
  });
  const res = await contract.callSendMethod('ManagerForwardCall', '', {
    caHash: caHash,
    methodName: 'UnApprove',
    contractAddress: chainInfo.defaultToken.address,
    args: {
      symbol: '*',
      spender: contractAddress,
      amount,
    },
  });
  console.log('===unapproveTokenAllowance result', res);
};
