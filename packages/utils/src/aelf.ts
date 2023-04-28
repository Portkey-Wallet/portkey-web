import AElf from 'aelf-sdk';

export const getAelfInstance = (rpcUrl: string, timeout: number = 20000) => {
  return new AElf(new AElf.providers.HttpProvider(rpcUrl, timeout));
};

export type EncodedParams = {
  instance: any;
  functionName: string;
  paramsOption: any;
  contract: any;
};
/**
 * encodedTx
 * @returns raw string / { error: { message } }
 */
export const encodedTx = async ({ instance, functionName, paramsOption, contract }: EncodedParams) => {
  try {
    const chainStatus = await instance.chain.getChainStatus();
    const raw = await contract[functionName].getSignedTx(paramsOption, {
      height: chainStatus?.BestChainHeight,
      hash: chainStatus?.BestChainHash,
    });
    return raw;
  } catch (error) {
    return { error };
  }
};

export const getELFContract = async (rpcUrl: string, tokenAddress: string, privateKey: string) => {
  const aelf = getAelfInstance(rpcUrl);
  const wallet = getWallet(privateKey);
  return await aelf.chain.contractAt(tokenAddress, wallet);
};

export function getWallet(privateKey: string) {
  return AElf.wallet.getWalletByPrivateKey(privateKey);
}
