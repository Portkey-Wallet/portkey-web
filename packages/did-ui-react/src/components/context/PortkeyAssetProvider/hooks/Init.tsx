import { useCallback, useEffect } from 'react';
import { usePortkey } from '../../index';
import { message } from 'antd';
import { did } from '../../../../utils';
import { getHolderInfoByContract } from '../../../../utils/sandboxUtil/getHolderInfo';
import { basicAssetView } from '../actions';
import { usePortkeyAsset } from '..';

export const useStateInit = () => {
  const [{ sandboxId, chainType }] = usePortkey();
  const [{ pin, caHash, originChainId, managerPrivateKey, didStorageKeyName }, { dispatch }] = usePortkeyAsset();

  const getHolderInfo = useCallback(
    async (managerAddress: string) => {
      if (!originChainId) throw 'Please configure `originChainId` in PortkeyAssetProvider';
      if (!caHash) throw 'Please configure `caHash` in PortkeyAssetProvider';
      const holderInfo = await getHolderInfoByContract({
        sandboxId,
        chainId: originChainId,
        chainType,
        paramsOption: {
          caHash,
        },
      });
      const managerInfo = holderInfo.managerInfos;
      const isExist = managerInfo.some((value) => managerAddress === value.address);
      if (!isExist) throw message.error('Manager is not exist, please check `managerPrivateKey` or `caHash`');
      did.didWallet.caInfo = {
        [originChainId]: {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        },
      };
      const guardian = holderInfo.guardianList.guardians.find((guardian) => guardian.isLoginGuardian);
      console.log(holderInfo.guardianList.guardians, 'holderInfo.guardianList.guardians');
      dispatch(basicAssetView.setGuardianList.actions(holderInfo.guardianList.guardians));
      if (guardian)
        did.didWallet.accountInfo = {
          loginAccount: guardian.guardianIdentifier || guardian.identifierHash,
        };
      await did.didWallet.getCAHolderInfo(originChainId);

      return did;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caHash, chainType, originChainId, sandboxId],
  );

  const loadCaInfoByCaHash = useCallback(async () => {
    if (!managerPrivateKey) throw 'Please configure manager information(`managerPrivateKey`)';
    did.didWallet.createByPrivateKey(managerPrivateKey);
  }, [managerPrivateKey]);

  const loadCaInfo = useCallback(async () => {
    try {
      if (!pin) {
        await loadCaInfoByCaHash();
      } else {
        await did.load(pin, didStorageKeyName);
      }

      await getHolderInfo(did.didWallet.managementAccount?.address as string);

      const wallet = {
        caInfo: did.didWallet.caInfo,
        managementAccount: did.didWallet.managementAccount,
        accountInfo: did.didWallet.accountInfo,
      };
      dispatch(basicAssetView.setDIDWallet.actions(wallet));
    } catch (error) {
      console.error('loadCaInfo:', error);
    }
  }, [didStorageKeyName, dispatch, getHolderInfo, loadCaInfoByCaHash, pin]);

  useEffect(() => {
    loadCaInfo();
  }, [loadCaInfo]);
};

export function Updater() {
  useStateInit();
  return null;
}
