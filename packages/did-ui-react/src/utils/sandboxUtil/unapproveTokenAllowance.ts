import { ChainId } from '@portkey/types';
import { did } from '..';
import { getContractBasic } from '@portkey/contracts';
import { getChainInfo } from '../../hooks/useChainInfo';
import { aelf } from '@portkey/utils';

export const unapproveTokenAllowance = async ({
  targetChainId,
  contractAddress,
  amount,
}: {
  targetChainId?: ChainId;
  contractAddress: string;
  amount: number;
}) => {
  const chainInfo = await getChainInfo(targetChainId);
  const contract = await getContractBasic({
    contractAddress: chainInfo.defaultToken.address,
    account: aelf.getWallet(did?.didWallet?.managementAccount?.privateKey || ''),
    rpcUrl: chainInfo?.endPoint,
  });
  const res = await contract.callSendMethod('UnApprove', '', {
    symbol: '*',
    spender: contractAddress,
    amount,
  });
  console.log('===unapproveTokenAllowance result', res);
};
