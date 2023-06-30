import { portkey } from '@portkey/accounts';
import { Button, message } from 'antd';
import clsx from 'clsx';
import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { DEVICE_INFO_VERSION, DEVICE_TYPE, getDeviceInfo, isSafariBrowser } from '../../constants/device';
import { PORTKEY_SOCIAL_LOGIN_URL } from '../../constants/socialLogin';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { LoginQRData, RegisterType } from '../../types';
import { did, handleErrorMessage, setLoading } from '../../utils';
import CustomSvg from '../CustomSvg';
import { DIDWalletInfo } from '../types';
import { stringifyUrl } from 'query-string';
import './index.less';
import { randomId } from '@portkey/utils';

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
  const isVisibility = useRef<boolean>();
  const timeRef = useRef<any>();
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

  const pagehideHandler = useCallback(() => {
    clearTimeout(timeRef.current);
  }, []);

  const visibilitychange = useCallback(() => {
    if (isVisibility.current) return;
    isVisibility.current = true;
    const tag = document.hidden || (document as any)?.webkitHidden;
    tag && pagehideHandler();
  }, [pagehideHandler]);

  const onPortkeySuccess = useCallback(async () => {
    try {
      if (!networkType) throw 'Missing network type';
      setLoading(true, {
        text: 'Synchronizing on-chain account information...',
        cancelable: true,
        onCancel: () => {
          intervalHandler.remove();
        },
      });
      if (timeRef.current) clearTimeout(timeRef.current);

      timeRef.current = setTimeout(() => {
        setLoading(false);
        if (isSafariBrowser()) {
          // message.warning('Please download the latest Portkey app from Google Play or the App Store.');
        } else {
          message.warning({
            content: 'Please download the latest Portkey app from Google Play or the App Store.',
            type: 'warning',
            icon: <CustomSvg type="waring" />,
            className: 'portkey-waring-download',
          });
        }

        isVisibility.current = false;
      }, 5000);

      isVisibility.current = false;
      // create page hide event
      document.addEventListener('visibilitychange', visibilitychange, false);
      document.addEventListener('webkitvisibilitychange', visibilitychange, false);
      window.addEventListener('pagehide', pagehideHandler, false);

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

      window.location.href = stringifyUrl(
        {
          url: `${PORTKEY_SOCIAL_LOGIN_URL}${window.location.host}/login`,
          query: { data: dataStr, extraData },
        },
        { encode: true },
      );

      return () => {
        document.removeEventListener('visibilitychange', visibilitychange);
        document.removeEventListener('webkitvisibilitychange', visibilitychange);
        document.removeEventListener('pagehide', pagehideHandler);
      };
    } catch (error) {
      console.log(error, 'GoogleAuth===error');
      message.error(handleErrorMessage(error));
    } finally {
      // setLoading(false);
    }
  }, [deviceInfo, generateKeystore, intervalHandler, networkType, pagehideHandler, visibilitychange, websiteInfo]);

  return (
    <Button className={clsx('social-login-btn')} onClick={onPortkeySuccess}>
      <CustomSvg type="Portkey-login" />
      {`${type} with Portkey`}
    </Button>
  );
}
