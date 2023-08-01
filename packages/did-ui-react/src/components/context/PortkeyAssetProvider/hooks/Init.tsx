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
      chainIdList.forEach(async (chainId: ChainId) => {
        const holderInfo = await getHolderInfoByContract({
          sandboxId,
          chainId,
          chainType,
          paramsOption: {
            caHash,
          },
        });
        did.didWallet.caInfo[chainId] = {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        };
        dispatch(basicAssetView.setCAInfo.actions({ ...did.didWallet.caInfo }));
      });
    },
    [chainType, dispatch, sandboxId],
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
      const chainIdList = Object.keys(chainsInfo).filter((chainId) => chainId !== originChainId);
      fetchCAAddressByChainId(chainIdList as ChainId[], caHash);

      did.didWallet.caInfo = {
        [originChainId]: {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        },
      };
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

  const loadCaInfoByCaHash = useCallback(async () => {
    if (!managerPrivateKey) throw 'Please configure manager information(`managerPrivateKey`)';
    did.didWallet.createByPrivateKey(managerPrivateKey);
  }, [managerPrivateKey]);

  const loadCaInfo = useCallback(async () => {
    try {
      dispatch(basicAssetView.initialized.actions(false));

      if (!pin) {
        await loadCaInfoByCaHash();
      } else {
        await did.load(pin, didStorageKeyName);
      }
      const storageCaHash = did.didWallet?.caInfo?.[originChainId]?.['caHash'];
      // console.log(did, caHash, 'storageCaHash===');
      if (caHash && storageCaHash && storageCaHash !== caHash)
        throw 'Please check whether the entered caHash is correct';

      if (!caHash && !storageCaHash) throw 'Please configure `caHash` in PortkeyAssetProvider';

      await getHolderInfo({
        caHash: caHash || storageCaHash,
        managerAddress: did.didWallet.managementAccount?.address as string,
      });

      const wallet = {
        caInfo: did.didWallet.caInfo,
        managementAccount: did.didWallet.managementAccount,
        accountInfo: did.didWallet.accountInfo,
      };
      dispatch(basicAssetView.setDIDWallet.actions(wallet));
      AuthServe.addRequestAuthCheck(originChainId);
      AuthServe.setRefreshTokenConfig(originChainId);
      dispatch(basicAssetView.initialized.actions(true));
    } catch (error) {
      console.error('loadCaInfo:', error);
    }
  }, [caHash, didStorageKeyName, dispatch, getHolderInfo, loadCaInfoByCaHash, originChainId, pin]);
  useEffect(() => {
    loadCaInfo();
  }, [loadCaInfo]);
};

export function Updater() {
  useStateInit();
  return null;
}
