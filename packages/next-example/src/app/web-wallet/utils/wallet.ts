import { DID } from '@portkey/did';
import { WEB_WALLET_DEFAULT_STORAGE_KEY } from '../constants/wallet';
import { COMMON_PRIVATE } from '../constants/wallet';
import AElf from 'aelf-sdk';
import { getContractBasic } from '@portkey/contracts';

export const getWebWalletStorageKey = (appId?: string) =>
  `${WEB_WALLET_DEFAULT_STORAGE_KEY}:${appId ?? 'wallet-appId'}`;

export const getManager = async (did: DID, pin: string) => {
  const { didWallet } = await did.load(pin);
  if (!didWallet || !didWallet?.managementAccount || !didWallet?.managementAccount?.privateKey) return;
  return getWallet(didWallet?.managementAccount?.privateKey);
};

export function getWallet(privateKey = COMMON_PRIVATE) {
  return AElf.wallet.getWalletByPrivateKey(privateKey);
}

export function getSignature(manager: any, data: any) {
  return manager.keyPair.sign(AElf.utils.sha256(data));
}
export function getTransactionSignature(manager: any, data: any) {
  return manager.keyPair.sign(AElf.utils.sha256(Buffer.from(data, 'hex')), {
    canonical: true,
  });
}
export function getManagerSignature(manager: any, data: any) {
  return manager.keyPair.sign(AElf.utils.sha256(data), {
    canonical: true,
  });
}

export function getContract({
  manager,
  rpcUrl,
  contractAddress,
}: {
  manager: any;
  rpcUrl: string;
  contractAddress: string;
}) {
  if (!manager) return;
  return getContractBasic({ rpcUrl, contractAddress, account: manager });
}
