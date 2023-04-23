import { portkey } from '@portkey/accounts';
import { Button, message } from 'antd';
import clsx from 'clsx';
import { useRef, useCallback, useState, useEffect } from 'react';
import { isSafariBrowser } from '../../constants/device';
import { PORTKEY_SOCIAL_LOGIN_URL } from '../../constants/socialLogin';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { RegisterType } from '../../types';
import { did, handleErrorMessage, setLoading } from '../../utils';
import CustomSvg from '../CustomSvg';
import { DIDWalletInfo } from '../types';

export default function WakeUpPortkey({
  type,
  onFinish,
}: {
  type: RegisterType;
  onFinish?: (info: Omit<DIDWalletInfo, 'pin'>) => void;
}) {
  const isVisibility = useRef<boolean>();
  const timeRef = useRef<any>();

  const [managementAccount, setManagementAccount] = useState<portkey.WalletAccount>();
  const caWallet = useIntervalQueryCAInfo({
    address: managementAccount?.address,
  });

  useEffect(() => {
    caWallet &&
      managementAccount &&
      onFinish?.({
        chainId: caWallet.chainId,
        caInfo: caWallet.info,
        walletInfo: managementAccount,
      });
  }, [caWallet, managementAccount, onFinish]);

  const generateKeystore = useCallback(() => {
    try {
      const ditInit = did.create();
      const managementAccount = ditInit.didWallet.managementAccount;
      setManagementAccount(managementAccount);
    } catch (error: any) {
      console.error(error, 'ScanBase===');

      message.error(handleErrorMessage(error));
    }
  }, []);

  const pagehideHandler = useCallback(() => {
    clearTimeout(timeRef.current);
    generateKeystore();
  }, [generateKeystore]);

  const visibilitychange = useCallback(() => {
    if (isVisibility.current) return;
    isVisibility.current = true;
    const tag = document.hidden || (document as any)?.webkitHidden;
    tag && pagehideHandler();
  }, [pagehideHandler]);

  const onPortkeySuccess = useCallback(async () => {
    try {
      setLoading(true);
      if (timeRef.current) clearTimeout(timeRef.current);

      timeRef.current = setTimeout(() => {
        setLoading(false);
        if (isSafariBrowser()) {
          // message.warning('Please download the latest Portkey app from Google Play or the App Store.');
        } else {
          message.warning('Please download the latest Portkey app from Google Play or the App Store.');
        }

        isVisibility.current = false;
      }, 5000);

      isVisibility.current = false;

      document.addEventListener('visibilitychange', visibilitychange, false);
      document.addEventListener('webkitvisibilitychange', visibilitychange, false);
      window.addEventListener('pagehide', pagehideHandler, false);

      window.location.href = `${PORTKEY_SOCIAL_LOGIN_URL}/2222`;

      return () => {
        document.removeEventListener('visibilitychange', visibilitychange);
        document.removeEventListener('webkitvisibilitychange', visibilitychange);
        document.removeEventListener('pagehide', pagehideHandler);
      };
    } catch (error) {
      console.log(error, 'GoogleAuth===error');
    } finally {
      // setLoading(false);
    }
  }, [pagehideHandler, visibilitychange]);

  return (
    <Button className={clsx('social-login-btn')} onClick={onPortkeySuccess}>
      <CustomSvg type="Portkey-login" />
      {`${type} with Portkey`}
    </Button>
  );
}
