import { portkey } from '@portkey/accounts';
import { Button, message } from 'antd';
import clsx from 'clsx';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { DEVICE_INFO_VERSION, DEVICE_TYPE, getDeviceInfo } from '../../constants/device';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { LoginQRData, RegisterType } from '../../types';
import { did, handleErrorMessage, setLoading } from '../../utils';
import CustomSvg from '../CustomSvg';
import { DIDWalletInfo } from '../types';
import { randomId } from '@portkey/utils';
import { evokePortkey } from '@portkey/onboarding';
import './index.less';

export default function WakeUpPortkey({
  type,
  networkType,
  websiteInfo,
  onFinish,
}: {
  type: RegisterType;
  networkType?: string;
  websiteInfo: {};
  onFinish?: (info: Omit<DIDWalletInfo, 'pin'>) => void;
}) {
  const deviceInfo = useMemo(() => getDeviceInfo(DEVICE_TYPE), []);

  const [managementAccount, setManagementAccount] = useState<portkey.WalletAccount>();
  const [caWallet, intervalHandler] = useIntervalQueryCAInfo({
    address: managementAccount?.address,
  });

  useEffect(() => {
    if (caWallet && managementAccount) {
      onFinish?.({
        chainId: caWallet.chainId,
        caInfo: caWallet.info,
        accountInfo: caWallet.accountInfo,
        walletInfo: managementAccount.wallet,
      });
      setLoading(false);
    }
  }, [caWallet, managementAccount, onFinish]);

  const generateKeystore = useCallback(() => {
    const ditInit = did.create();
    const managementAccount = ditInit.didWallet.managementAccount;
    setManagementAccount(managementAccount);
    return managementAccount;
  }, []);

  const onPortkeySuccess = useCallback(async () => {
    try {
      if (!networkType) throw 'Missing network type';
      setLoading(true, {
        text: 'Loading...please wait',
        cancelable: true,
        onCancel: () => {
          intervalHandler.remove();
        },
      });
      // create scheme data
      const managementAccount = await generateKeystore();
      const data: LoginQRData = {
        type: 'login',
        address: managementAccount?.wallet.address as string,
        id: randomId(),
        netWorkType: networkType,
        chainType: 'aelf',
        extraData: {
          deviceInfo,
          version: DEVICE_INFO_VERSION,
        },
      };
      const dataStr = JSON.stringify(data);

      const extraData = JSON.stringify(websiteInfo);

      evokePortkey.app({
        action: 'login',
        custom: { data: dataStr, extraData },
        onStatusChange: (status) => {
          if (status === 'failure') {
            setLoading(false);
            message.error('Evoke portkey app timeout');
          }
        },
      });
    } catch (error) {
      message.error(handleErrorMessage(error));
    } finally {
      // setLoading(false);
    }
  }, [deviceInfo, generateKeystore, intervalHandler, networkType, websiteInfo]);

  return (
    <Button className={clsx('social-login-btn')} onClick={onPortkeySuccess}>
      <CustomSvg type="Portkey-login" />
      {`${type} with Portkey`}
    </Button>
  );
}
