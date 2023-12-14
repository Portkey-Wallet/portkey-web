import { CustomContractBasic } from './CustomContractBasic';

export type GetTransferLimitParams = {
  caHash: string;
  symbol: string;
  rpcUrl: string;
  caContractAddress: string;
  sandboxId?: string;
};

export type GetTransferLimitResult = {
  dailyLimit: string;
  singleLimit: string;
  restricted: boolean;
};

export async function getTransferLimit(params: GetTransferLimitParams): Promise<GetTransferLimitResult | undefined> {
  const { caHash, symbol, rpcUrl, caContractAddress, sandboxId } = params;

  const limitReq = await CustomContractBasic.callViewMethod({
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
  });

  if (!limitReq?.error) {
    const { singleLimit, dailyLimit } = limitReq.data || {};

    return {
      dailyLimit,
      singleLimit,
      restricted: dailyLimit != '-1' && singleLimit != '-1',
    };
  }
  return;
}
