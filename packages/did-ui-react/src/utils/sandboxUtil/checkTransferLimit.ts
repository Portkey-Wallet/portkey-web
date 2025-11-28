import BigNumber from 'bignumber.js';
import { ZERO } from '../../constants/misc';
import { timesDecimals, divDecimals } from '../converter';
import { CustomContractBasic } from './CustomContractBasic';

export type CheckTransferLimitParams = {
  symbol: string;
  decimals: number | string;
  amount: string;
};

export type CheckTransferLimitResult = {
  isDailyLimited: boolean;
  isSingleLimited: boolean;
  // balances with decimals processed
  showDailyLimit: BigNumber;
  // balances with decimals processed
  showDailyBalance: BigNumber;
  // balances with decimals processed
  showSingleBalance: BigNumber;
  dailyLimit: BigNumber;
  dailyBalance: BigNumber;
  singleBalance: BigNumber;
};

export const checkTransferLimit = async ({
  caHash,
  params,
  rpcUrl,
  caContractAddress,
  sandboxId = '',
}: {
  caHash: string;
  params: CheckTransferLimitParams;
  rpcUrl: string;
  caContractAddress: string;
  sandboxId?: string;
}): Promise<CheckTransferLimitResult | undefined> => {
  const { symbol, decimals, amount } = params;

  const [limitReq, defaultLimitReq] = await Promise.all([
    CustomContractBasic.callViewMethod({
      contractOptions: {
        rpcUrl: rpcUrl,
        contractAddress: caContractAddress,
      },
      functionName: 'GetTransferLimit',
      paramsOption: {
        caHash: caHash,
        symbol: symbol,
      },
      sandboxId,
    }),
    CustomContractBasic.callViewMethod({
      contractOptions: {
        rpcUrl: rpcUrl,
        contractAddress: caContractAddress,
      },
      functionName: 'GetDefaultTokenTransferLimit',
      paramsOption: {
        caHash: caHash,
        symbol: symbol,
      },
      sandboxId,
    }),
  ]);

  const bigAmount = timesDecimals(amount, decimals);
  let dailyBalance, singleBalance, dailyLimit;
  if (!limitReq?.error) {
    const { singleLimit, dailyLimit: contractDailyLimit, dailyTransferredAmount } = limitReq.data || {};
    dailyLimit = ZERO.plus(contractDailyLimit);
    dailyBalance = dailyLimit.minus(dailyTransferredAmount);
    singleBalance = ZERO.plus(singleLimit);
  } else if (!defaultLimitReq?.error) {
    const { defaultLimit } = defaultLimitReq.data || {};
    dailyLimit = ZERO.plus(defaultLimit);
    dailyBalance = dailyLimit;
    singleBalance = ZERO.plus(defaultLimit);
  }

  if (!dailyLimit || !dailyBalance || !singleBalance || dailyBalance.isNaN() || singleBalance.isNaN()) return;

  return {
    isDailyLimited: !dailyLimit.eq(-1) && bigAmount.gt(dailyBalance),
    isSingleLimited: !singleBalance.eq(-1) && bigAmount.gt(singleBalance),
    dailyLimit,
    showDailyLimit: divDecimals(dailyLimit, decimals),
    dailyBalance,
    showDailyBalance: divDecimals(dailyBalance, decimals),
    singleBalance,
    showSingleBalance: divDecimals(singleBalance, decimals),
  };
};
