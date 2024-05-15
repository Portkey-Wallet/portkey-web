import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { ReactNode } from 'react';
import type { LoginQRData, OnErrorFunc } from '../../types';
import ScanBase from '../ScanBase';
import { GridType, LoginFinishWithoutPin } from '../types';
import type { ChainId, ChainType } from '@portkey/types';
import type { portkey } from '@portkey/accounts';
import { did, errorTip, handleErrorMessage } from '../../utils';
import { DEVICE_INFO_VERSION, DEVICE_TYPE, getDeviceInfo } from '../../constants/device';
import clsx from 'clsx';
import { randomId } from '@portkey/utils';
import './index.less';

export interface ScanCardProps {
  chainId?: ChainId;
  backIcon?: ReactNode;
  networkType?: string;
  isMobile?: boolean;
  chainType?: ChainType;
  isErrorTip?: boolean;
  wrapperClassName?: string;
  gridType?: GridType;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onFinish?: LoginFinishWithoutPin;
  onFinishFailed?: (errorInfo: any) => void;
}

export default function ScanCard({
  chainId = 'AELF',
  backIcon,
  isMobile = false,
  isErrorTip = true,
  gridType,
  chainType,
  networkType,
  wrapperClassName,
  onError,
  onBack,
  onFinish,
}: ScanCardProps) {
  const [managementAccount, setManagementAccount] = useState<portkey.WalletAccount>();
  const deviceInfo = useMemo(() => getDeviceInfo(DEVICE_TYPE), []);
  const [isWaitingAuth] = useState<boolean>();

  const onFinishRef = useRef<LoginFinishWithoutPin | undefined>(onFinish);

  const [caWallet] = useIntervalQueryCAInfo({
    address: managementAccount?.address,
    chainId,
  });

  const generateKeystore = useCallback(() => {
    try {
      const ditInit = did.create();
      const managementAccount = ditInit.didWallet.managementAccount;
      setManagementAccount(managementAccount);
    } catch (error: any) {
      console.error(error, 'ScanBase===');

      return errorTip(
        {
          errorFields: 'ScanBase',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    }
  }, [isErrorTip, onError]);

  useEffectOnce(() => {
    const timer = setTimeout(() => {
      generateKeystore();
    }, 10);
    return () => {
      timer && clearTimeout(timer);
    };
  });

  const qrData = useMemo(() => {
    if (!managementAccount || !networkType) return '{}';
    const data: LoginQRData = {
      type: 'login',
      address: managementAccount.address,
      id: randomId(),
      networkType: networkType,
      chainType: chainType ?? 'aelf',
      extraData: {
        deviceInfo,
        version: DEVICE_INFO_VERSION,
      },
    };

    return JSON.stringify(data);
  }, [chainType, deviceInfo, managementAccount, networkType]);

  // Listen whether the user is authorized
  // useEffect(() => {
  //   try {
  //     const data: LoginQRData = JSON.parse(qrData);
  //     if (!data?.id) return;
  //     if (!ConfigProvider.config.socketUrl) console.warn('SocketUrl is not config');
  //     const clientId = `${data.address}_${data.id}`;
  //     const didSignalr = new DIDSignalr();
  //     didSignalr.onScanLogin(() => {
  //       setIsWaitingAuth(true);
  //     });
  //     didSignalr.doOpen({ url: dealURLLastChar(ConfigProvider.config.socketUrl), clientId }).catch((error) => {
  //       console.warn('Socket:', error);
  //     });
  //   } catch (error) {
  //     console.warn('Socket:', error);
  //   }
  // }, [qrData]);

  useEffect(() => {
    caWallet &&
      managementAccount &&
      onFinishRef.current?.({
        chainId: caWallet.chainId,
        caInfo: caWallet.info,
        walletInfo: managementAccount.wallet,
        accountInfo: caWallet.accountInfo,
        createType: 'addManager',
      });
  }, [caWallet, managementAccount]);

  return (
    <div className={clsx('scan-base-wrapper', wrapperClassName)}>
      <ScanBase
        isMobile={isMobile}
        gridType={gridType}
        isWaitingAuth={isWaitingAuth}
        backIcon={backIcon}
        onBack={onBack}
        qrData={qrData}
      />
    </div>
  );
}
