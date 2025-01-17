import { WEB_WALLET_DEFAULT_STORAGE_KEY } from '../constants/wallet';
import { COMMON_PRIVATE } from '../constants/wallet';
import AElf from 'aelf-sdk';
import { getContractBasic } from '@portkey/contracts';
import { did } from '@portkey/did-ui-react';
import { aelf } from '@portkey/utils';
export const getWebWalletStorageKey = (appId?: string) =>
  `${WEB_WALLET_DEFAULT_STORAGE_KEY}:${appId ?? 'wallet-appId'}`;

export const getManager = async () => {
  return getWallet(did.didWallet?.managementAccount?.privateKey);
};

export function getWallet(privateKey = COMMON_PRIVATE) {
  return aelf.getWallet(privateKey);
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
