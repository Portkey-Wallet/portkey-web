import { useEffect, useMemo } from 'react';
import { IStorageSuite } from '@portkey/types';
import { ConfigProvider, usePortkeyAsset } from '../components';
import { useCurrentChainList } from './useChainInfo';
import { GlobalConfigProps } from '../components/config-provider/types';
import { CrossTransfer } from '../utils/withdraw';

const crossChainTransfer = new CrossTransfer();

export const CROSS_CHAIN_ETRANSFER_SUPPORT_SYMBOL = ['ELF', 'USDT'];
export class Store implements IStorageSuite {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
}
const myStore = new Store();

export const useCrossTransferByEtransfer = (pin?: string) => {
  // TODO: add it
  const { chainList } = useCurrentChainList();
  const [{ caHash, managementAccount }] = usePortkeyAsset();
  const eTransferUrl = ConfigProvider.getConfig('eTransferUrl') as GlobalConfigProps['eTransferUrl'];
  const eTransferCA = ConfigProvider.getConfig('eTransferCA') as GlobalConfigProps['eTransferCA'];

  useEffect(() => {
    if (!eTransferUrl || !pin || !chainList || !eTransferCA) return;
    crossChainTransfer.init({
      walletInfo: {
        caHash,
        AESEncryptPrivateKey: managementAccount?.privateKey || '',
      },
      eTransferUrl,
      pin,
      chainList,
      eTransferCA,
      storage: myStore,
    });
  }, [caHash, eTransferCA, eTransferUrl, pin, chainList, managementAccount?.privateKey]);

  return useMemo(
    () => ({
      withdraw: crossChainTransfer.withdraw,
      withdrawPreview: crossChainTransfer.withdrawPreview,
    }),
    [],
  );
};
