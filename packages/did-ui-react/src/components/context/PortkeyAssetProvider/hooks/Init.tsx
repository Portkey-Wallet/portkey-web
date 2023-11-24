import { useCallback } from 'react';
import { usePortkey } from '../../index';
import { message } from 'antd';
import { AuthServe, did, handleErrorMessage } from '../../../../utils';
import { getHolderInfoByContract } from '../../../../utils/sandboxUtil/getHolderInfo';
import { basicAssetView } from '../actions';
import { usePortkeyAsset } from '..';
import { ChainId } from '@portkey/types';
import { useThrottleEffect } from '../../../../hooks/throttle';
import { useTxFeeInit } from './txFee';

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

      dispatch(basicAssetView.setCAInfo.actions({ ...did.didWallet.caInfo }));
    },
    [chainType, dispatch, sandboxId],
  );

  const getAccountInfo = useCallback(async () => {
    try {
      await did.didWallet.getCAHolderInfo(originChainId);
      dispatch(
        basicAssetView.setDIDWallet.actions({
          accountInfo: did.didWallet.accountInfo,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }, [dispatch, originChainId]);

  const getHolderInfo = useCallback(
    async ({ managerAddress, caHash }: { managerAddress: string; caHash: string }) => {
      if (!originChainId) throw Error('Please configure `originChainId` in PortkeyAssetProvider');
      if (!caHash) throw Error('Please configure `caHash` in PortkeyAssetProvider');
      const chainsInfo = await did.didWallet.getChainsInfo();
      getAccountInfo();
      const holderInfo = await getHolderInfoByContract({
        sandboxId,
        chainId: originChainId,
        chainType,
        paramsOption: {
          caHash,
        },
      });
      console.log(holderInfo, managerAddress, 'holderInfo===');
      const managerInfo = holderInfo.managerInfos;
      const isExist = managerInfo.some((value) => managerAddress === value.address);
      if (!isExist) throw Error('Manager is not exist, please check `managerPrivateKey` or `caHash`');
      did.didWallet.caInfo = {
        [originChainId]: {
          caAddress: holderInfo.caAddress,
          caHash: holderInfo.caHash,
        },
      };
      dispatch(basicAssetView.setCAInfo.actions({ ...did.didWallet.caInfo }));

      // fetch other caAddress on other chain
      const chainIdList = Object.keys(chainsInfo).filter((chainId) => chainId !== originChainId);
      fetchCAAddressByChainId(chainIdList as ChainId[], caHash);

      const guardian = holderInfo.guardianList.guardians.find((guardian) => guardian.isLoginGuardian);
      did
        .getHolderInfo({
          chainId: originChainId as ChainId,
          caHash,
        })
        .then((payload) => {
          const { guardians } = payload?.guardianList ?? { guardians: [] };
          dispatch(basicAssetView.setGuardianList.actions(guardians));
        });

      if (guardian) did.didWallet.accountInfo.loginAccount = guardian.guardianIdentifier || guardian.identifierHash;

      return did;
    },
    [chainType, dispatch, fetchCAAddressByChainId, getAccountInfo, originChainId, sandboxId],
  );

  const loadManager = useCallback(async () => {
    if (!managerPrivateKey) throw Error('Please configure manager information(`managerPrivateKey`)');
    did.didWallet.createByPrivateKey(managerPrivateKey);
  }, [managerPrivateKey]);

  const loadCaInfo = useCallback(async () => {
    AuthServe.addRequestAuthCheck(originChainId);
    AuthServe.setRefreshTokenConfig(originChainId);
    if (!pin) {
      await loadManager();
    } else {
      await did.load(pin, didStorageKeyName);
    }
    const storageCaHash = did.didWallet?.caInfo?.[originChainId]?.['caHash'];
    if (caHash && storageCaHash && storageCaHash !== caHash)
      throw Error('Please check whether the entered caHash is correct');
    const currentCaHash = caHash || storageCaHash;
    if (!currentCaHash) throw Error('Please configure `caHash` in PortkeyAssetProvider');
    AuthServe.addRequestAuthCheck(originChainId);
    AuthServe.setRefreshTokenConfig(originChainId);
    await getHolderInfo({
      caHash: currentCaHash,
      managerAddress: did.didWallet.managementAccount?.address as string,
    });

    const wallet = {
      managementAccount: did.didWallet.managementAccount,
      accountInfo: did.didWallet.accountInfo,
      caHash: currentCaHash,
    };
    console.log(wallet, 'wallet===');
    dispatch(basicAssetView.setDIDWallet.actions(wallet));

    dispatch(basicAssetView.initialized.actions(true));
  }, [caHash, didStorageKeyName, dispatch, getHolderInfo, loadManager, originChainId, pin]);

  useThrottleEffect(() => {
    loadCaInfo().catch((err) => {
      console.log(err, 'loadCaInfo===error');
      if (err?.status === 500) {
        message.error('PortkeyAssetProvider init: Server error(500)');
      } else if (err?.status !== 401) {
        message.error('PortkeyAssetProvider init: ' + handleErrorMessage(err, 'Network error'));
      }
    });
  }, [loadCaInfo]);
};

export function Updater() {
  // load did waller
  useStateInit();
  // load tx fee
  useTxFeeInit();
  return null;
}
