import { ContractBasic } from '@portkey/contracts';

export const getELFChainBalance = async (tokenContract: any, symbol: string, owner: string): Promise<string> => {
  let balance;
  if (tokenContract instanceof ContractBasic) {
    const req = await tokenContract.callViewMethod('GetBalance', {
      symbol,
      owner,
    });
    if (!req.error) {
      balance = req.data;
    }
  } else {
    balance = await tokenContract.GetBalance.call({
      symbol,
      owner,
    });
  }
  return balance?.balance ?? balance?.amount ?? '0';
};

type GetAllowanceParams = {
  symbol: string;
  owner: string;
  spender: string;
};

export async function getAllowance(tokenContract: ContractBasic, params: GetAllowanceParams) {
  const req = await tokenContract.callViewMethod('GetAllowance', params);
  if (req.error) throw req.error;
  return req.data.allowance;
}
