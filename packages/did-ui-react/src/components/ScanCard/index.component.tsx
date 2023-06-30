import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { ReactNode } from 'react';
import type { LoginQRData, OnErrorFunc } from '../../types';
import ScanBase from '../ScanBase';
import { LoginFinishWithoutPin } from '../types';
import type { ChainId, ChainType } from '@portkey/types';
import type { portkey } from '@portkey/accounts';
import { dealURLLastChar, did, errorTip } from '../../utils';
import { DEVICE_INFO_VERSION, DEVICE_TYPE, getDeviceInfo } from '../../constants/device';
import './index.less';
import clsx from 'clsx';
import { DIDSignalr } from '@portkey/socket';
import { randomId } from '@portkey/utils';

export interface ScanCardProps {
  chainId?: ChainId;
  backIcon?: ReactNode;
  networkType?: string;
  chainType?: ChainType;
  isErrorTip?: boolean;
  wrapperClassName?: string;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onFinish?: LoginFinishWithoutPin;
  onFinishFailed?: (errorInfo: any) => void;
}

export default function ScanCard({
  chainId = 'AELF',
  backIcon,
  isErrorTip = true,
  chainType,
  networkType,
  wrapperClassName,
  onError,
  onBack,
  onFinish,
}: ScanCardProps) {
  const [managementAccount, setManagementAccount] = useState<portkey.WalletAccount>();
  const deviceInfo = useMemo(() => getDeviceInfo(DEVICE_TYPE), []);
  const [isWaitingAuth, setIsWaitingAuth] = useState<boolean>();

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
          error,
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
      netWorkType: networkType,
      chainType: chainType ?? 'aelf',
      extraData: {
        deviceInfo,
        version: DEVICE_INFO_VERSION,
      },
    };

    return JSON.stringify(data);
  }, [chainType, deviceInfo, managementAccount, networkType]);

  // Listen whether the user is authorized
  useEffect(() => {
    const data: LoginQRData = JSON.parse(qrData);
    if (!data?.id) return;
    const clientId = `${data.address}_${data.id}`;
    const didSignalr = new DIDSignalr();
    didSignalr.doOpen({ url: `${dealURLLastChar(did.config.requestDefaults?.baseURL || '')}/ca`, clientId });
    didSignalr.onScanLogin(() => {
      setIsWaitingAuth(true);
    });
  }, [qrData]);

  useEffect(() => {
    caWallet &&
      managementAccount &&
      onFinish?.({
        chainId: caWallet.chainId,
        caInfo: caWallet.info,
        walletInfo: managementAccount.wallet,
        accountInfo: caWallet.accountInfo,
      });
  }, [caWallet, managementAccount, onFinish]);

  return (
    <div className={clsx('scan-base-wrapper', wrapperClassName)}>
      <ScanBase isWaitingAuth={isWaitingAuth} backIcon={backIcon} onBack={onBack} qrData={qrData} />
    </div>
  );
}
