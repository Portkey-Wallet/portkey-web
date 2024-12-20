import { ChainId } from '@portkey/types';
import { isEqAddress } from '@portkey/utils/dist/commonjs/wallet';

export const isMyPayTransactionFee = (caInfo: any, address: string, chainId?: ChainId) => {
  // manager transaction fee hide
  // const { walletInfo } = getWallet();
  // if (isEqAddress(walletInfo?.address, address)) return true;
  // const caInfo = getCurrentCaInfo();

  if (chainId) {
    const currentCaInfo = caInfo?.[chainId];
    if (!currentCaInfo) return false;
    return currentCaInfo.caAddress && isEqAddress(currentCaInfo.caAddress, address);
  }

  const addressList = Object.values(caInfo || {})
    .map((item: any) => item?.caAddress)
    .filter((i) => !!i);

  return addressList.some((i) => isEqAddress(i, address));
};
