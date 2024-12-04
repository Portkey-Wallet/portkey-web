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
  const chainStatus = await instance.chain.getChainStatus();
  const raw = await contract[functionName].getSignedTx(paramsOption, {
    height: chainStatus?.BestChainHeight,
    hash: chainStatus?.BestChainHash,
  });
  return raw;
};

export const getELFContract = async (
  rpcUrl: string,
  tokenAddress: string,
  privateKey: string,
  option: { refBlockNumberStrategy?: number } = {},
) => {
  const aelf = getAelfInstance(rpcUrl);
  const wallet = getWallet(privateKey);
  return await aelf.chain.contractAt(tokenAddress, wallet, option);
};

export function getWallet(privateKey: string) {
  return AElf.wallet.getWalletByPrivateKey(privateKey);
}

export const createNewWallet = () => {
  return AElf.wallet.createNewWallet();
};

export const getRawTx = ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
}: any) => {
  const rawTx = AElf.pbUtils.getTransaction(address, contractAddress, functionName, packedInput);
  rawTx.refBlockNumber = blockHeightInput;
  const blockHash = blockHashInput.match(/^0x/) ? blockHashInput.substring(2) : blockHashInput;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').subarray(0, 4);
  return rawTx;
};

export function encodeTransaction(tx: any): string {
  let _tx = AElf.pbUtils.Transaction.encode(tx).finish();
  if (_tx instanceof Buffer) {
    return _tx.toString('hex');
  }
  return AElf.utils.uint8ArrayToHex(_tx); // hex str
}
