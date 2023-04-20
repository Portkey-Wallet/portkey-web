import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { useIntervalQueryCAInfo } from '../../hooks/useIntervalQueryCAInfo';
import { ReactNode } from 'react';
import type { LoginQRData, OnErrorFunc } from '../../types';
import ScanBase from '../ScanBase';
import SetPin from './components/SetPin';
import { DIDWalletInfo } from '../types';
import type { ChainId, ChainType } from '@portkey/types';
import type { portkey } from '@portkey/accounts';
import { did, WalletError, errorTip } from '../../utils';
import { DEVICE_INFO_VERSION, DEVICE_TYPE, getDeviceInfo } from '../../constants/device';
import './index.less';
import clsx from 'clsx';

export interface ScanCardProps {
  chainId?: ChainId;
  backIcon?: ReactNode;
  netWorkType?: string;
  chainType?: ChainType;
  isErrorTip?: boolean;
  wrapperClassName?: string;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onFinish?: (walletInfo: DIDWalletInfo) => void;
  onFinishFailed?: (errorInfo: any) => void;
}

enum ScanStep {
  Scan = 'Scan',
  SetPin = 'SetPin',
}

export default function ScanCard({
  chainId = 'AELF',
  backIcon,
  isErrorTip,
  chainType,
  netWorkType,
  wrapperClassName,
  onError,
  onBack,
  onFinish,
  onFinishFailed,
}: ScanCardProps) {
  const [step, setStep] = useState<ScanStep>(ScanStep.Scan);
  const [managementAccount, setManagementAccount] = useState<portkey.WalletAccount>();
  const deviceInfo = useMemo(() => getDeviceInfo(DEVICE_TYPE), []);

  const caWallet = useIntervalQueryCAInfo({
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
    if (!managementAccount) return '';
    if (!netWorkType) return '';
    const data: LoginQRData = {
      type: 'login',
      address: managementAccount.address,
      netWorkType: netWorkType,
      chainType: chainType ?? 'aelf',
      extraData: {
        deviceInfo,
        version: DEVICE_INFO_VERSION,
      },
    };
    return JSON.stringify(data);
  }, [chainType, deviceInfo, managementAccount, netWorkType]);

  useEffect(() => {
    if (caWallet) setStep(ScanStep.SetPin);
  }, [caWallet]);

  const onFinishHandler = useCallback(
    (pin: string) => {
      if (!managementAccount) throw Error(WalletError.noCreateWallet);
      if (!caWallet) throw Error(WalletError.noCreateWallet);
      onFinish?.({
        pin,
        chainId: caWallet.chainId,
        caInfo: caWallet.info,
        walletInfo: managementAccount,
      });
    },
    [caWallet, managementAccount, onFinish],
  );

  return (
    <div className={clsx('scan-base-wrapper', wrapperClassName)}>
      {step === ScanStep.Scan && <ScanBase backIcon={backIcon} onBack={onBack} qrData={qrData} />}
      {step === ScanStep.SetPin && (
        <SetPin onFinish={onFinishHandler} onFinishFailed={onFinishFailed} onCancel={() => setStep(ScanStep.Scan)} />
      )}
    </div>
  );
}
