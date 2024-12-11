import { errorTip } from '../../utils';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import SetPinBase from '../SetPinBase/index.component';
import clsx from 'clsx';
import { AddManagerType, CreatePendingInfo, DIDWalletInfo } from '../types';
import { OnErrorFunc } from '../../types';
import type { AccountType, GuardiansApproved } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { useLoginWallet } from '../../hooks/useLoginWallet';
import SetPinMobileBase from '../SetPinMobileBase';
import { devices } from '@portkey/utils';
import BackHeader from '../BackHeader';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';
import './index.less';

export interface SetPinAndAddManagerProps {
  type: AddManagerType;
  className?: string;
  accountType?: AccountType;
  keyboard?: boolean;
  chainId?: ChainId;
  guardianIdentifier?: string;
  onlyGetPin?: boolean;
  guardianApprovedList: GuardiansApproved[];
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onClose?: () => void;
  onFinish?: (values: DIDWalletInfo | string) => void;
  onCreatePending?: (pendingInfo: CreatePendingInfo) => void;
}

function SetPinAndAddManager({
  type,
  chainId = 'AELF',
  keyboard: defaultKeyboard,
  className,
  onlyGetPin,
  accountType = 'Email',
  guardianIdentifier,
  guardianApprovedList,
  isErrorTip = true,
  onError,
  onBack,
  onClose,
  onFinish,
  onCreatePending,
}: SetPinAndAddManagerProps) {
  const { t } = useTranslation();
  const onFinishRef = useRef<SetPinAndAddManagerProps['onFinish']>(onFinish);
  const isMobile = useMemo(() => devices.isMobileDevices(), []);

  const keyboard = useMemo(() => isMobile && defaultKeyboard, [defaultKeyboard, isMobile]);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const createWallet = useLoginWallet({
    isErrorTip,
    onError,
    onCreatePending,
  });

  const onCreate = useCallback(
    async (pin: string) => {
      if (onlyGetPin) return onFinishRef?.current?.(pin);
      if (!guardianIdentifier)
        return errorTip(
          {
            errorFields: 'createWallet',
            error: 'No guardianIdentifier',
          },
          isErrorTip,
          onError,
        );

      const params = {
        pin,
        type,
        chainId,
        accountType,
        guardianIdentifier,
        guardianApprovedList,
      };
      const createResult = await createWallet(params);
      createResult && onFinishRef?.current?.(createResult);
    },
    [
      onlyGetPin,
      guardianIdentifier,
      isErrorTip,
      onError,
      type,
      chainId,
      accountType,
      guardianApprovedList,
      createWallet,
    ],
  );
  console.log('render SetPinAndAddManager', keyboard);
  return keyboard ? (
    <SetPinMobileBase
      type={type}
      className={clsx('portkey-card-height', className)}
      onFinish={onCreate}
      onCancel={onClose}
    />
  ) : (
    <div className="set-pin-pc-container">
      {onBack && (
        <BackHeader
          leftElement={false}
          title={<div className="set-pin-title">{t('Create a PIN to protect your wallet')}</div>}
          rightElement={
            <CustomSvg
              type="X"
              onClick={onBack}
              fillColor="black"
              style={{
                width: 20,
                height: 20,
              }}
            />
          }
        />
      )}
      <SetPinBase
        className={clsx('portkey-card-height', 'portkey-ui-set-pin-pc', className)}
        onFinish={onCreate}
        onFinishFailed={(err) =>
          errorTip(
            {
              errorFields: 'SetPinAndAddManager Form',
              error: `Form Error: ${err.errorFields[0].name}`,
            },
            isErrorTip,
            onError,
          )
        }
      />
    </div>
  );
}

export default SetPinAndAddManager;
