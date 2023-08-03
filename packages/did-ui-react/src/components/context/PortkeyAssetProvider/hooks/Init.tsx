import { useCallback, useEffect } from 'react';
import { usePortkey } from '../../index';
import { message } from 'antd';
import { AuthServe, did } from '../../../../utils';
import { getHolderInfoByContract } from '../../../../utils/sandboxUtil/getHolderInfo';
import { basicAssetView } from '../actions';
import { usePortkeyAsset } from '..';
import { ChainId } from '@portkey/types';

export const useStateInit = () => {
  const [{ sandboxId, chainType }] = usePortkey();
  const [{ pin, caHash, originChainId, managerPrivateKey, didStorageKeyName }, { dispatch }] = usePortkeyAsset();

  const fetchCAAddressByChainId = useCallback(
    async (chainIdList: ChainId[], caHash: string) => {
      const result = await Promise.all(
        chainIdList.map(async (chainId: ChainId) =>
          getHolderInfoByContract({
            sandboxId,
            chainId,
            chainType,
            paramsOption: {
              caHash,
            },
          }),
        ),
      );
      result.forEach((holderInfo, index) => {
        did.didWallet.caInfo[chainIdList[index]] = {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        };
      });
    },
    [chainType, sandboxId],
  );

  const getHolderInfo = useCallback(
    async ({ managerAddress, caHash }: { managerAddress: string; caHash: string }) => {
      if (!originChainId) throw 'Please configure `originChainId` in PortkeyAssetProvider';
      if (!caHash) throw 'Please configure `caHash` in PortkeyAssetProvider';
      const chainsInfo = await did.didWallet.getChainsInfo();
      const holderInfo = await getHolderInfoByContract({
        sandboxId,
        chainId: originChainId,
        chainType,
        paramsOption: {
          caHash,
        },
      });
      console.log(holderInfo, chainsInfo, 'holderInfo===');
      const managerInfo = holderInfo.managerInfos;
      const isExist = managerInfo.some((value) => managerAddress === value.address);
      if (!isExist) throw message.error('Manager is not exist, please check `managerPrivateKey` or `caHash`');
      did.didWallet.caInfo = {
        [originChainId]: {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        },
      };
      // fetch other caAddress on other chain
      const chainIdList = Object.keys(chainsInfo).filter((chainId) => chainId !== originChainId);
      await fetchCAAddressByChainId(chainIdList as ChainId[], caHash);
      dispatch(basicAssetView.setCAInfo.actions({ ...did.didWallet.caInfo }));

      const guardian = holderInfo.guardianList.guardians.find((guardian) => guardian.isLoginGuardian);
      dispatch(basicAssetView.setGuardianList.actions(holderInfo.guardianList.guardians));
      if (guardian)
        did.didWallet.accountInfo = {
          loginAccount: guardian.guardianIdentifier || guardian.identifierHash,
        };
      await did.didWallet.getCAHolderInfo(originChainId);

      return did;
    },
    [chainType, dispatch, fetchCAAddressByChainId, originChainId, sandboxId],
  );

  const loadManager = useCallback(async () => {
    if (!managerPrivateKey) throw 'Please configure manager information(`managerPrivateKey`)';
    did.didWallet.createByPrivateKey(managerPrivateKey);
  }, [managerPrivateKey]);

  const loadCaInfo = useCallback(async () => {
    dispatch(basicAssetView.initialized.actions(false));
    AuthServe.addRequestAuthCheck(originChainId);
    AuthServe.setRefreshTokenConfig(originChainId);
    if (!pin) {
      await loadManager();
    } else {
      await did.load(pin, didStorageKeyName);
    }
    const storageCaHash = did.didWallet?.caInfo?.[originChainId]?.['caHash'];
    if (caHash && storageCaHash && storageCaHash !== caHash) {
      const error = 'Please check whether the entered caHash is correct';
      message.error(error);
      throw error;
    }
    const currentCaHash = caHash || storageCaHash;
    if (!currentCaHash) {
      const error = 'Please configure `caHash` in PortkeyAssetProvider';
      message.error(error);
      throw error;
    }
    AuthServe.addRequestAuthCheck(originChainId);
    await AuthServe.setRefreshTokenConfig(originChainId);
    await getHolderInfo({
      caHash: currentCaHash,
      managerAddress: did.didWallet.managementAccount?.address as string,
    });

    const wallet = {
      caInfo: did.didWallet.caInfo,
      managementAccount: did.didWallet.managementAccount,
      accountInfo: did.didWallet.accountInfo,
      caHash: currentCaHash,
    };
    dispatch(basicAssetView.setDIDWallet.actions(wallet));

    dispatch(basicAssetView.initialized.actions(true));
  }, [caHash, didStorageKeyName, dispatch, getHolderInfo, loadManager, originChainId, pin]);
  useEffect(() => {
    loadCaInfo();
  }, [loadCaInfo]);
};

export function Updater() {
  useStateInit();
  return null;
}
