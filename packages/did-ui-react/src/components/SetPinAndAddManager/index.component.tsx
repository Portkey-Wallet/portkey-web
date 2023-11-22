import { errorTip } from '../../utils';
import { useCallback, useRef, useEffect } from 'react';
import SetPinBase from '../SetPinBase/index.component';
import clsx from 'clsx';
import { AddManagerType, CreatePendingInfo, DIDWalletInfo } from '../types';
import { OnErrorFunc } from '../../types';
import type { AccountType, GuardiansApproved } from '@portkey/services';
import { ChainId } from '@portkey/types';
import useLoginWallet from '../../hooks/useLoginWallet';

export interface SetPinAndAddManagerProps {
  type: AddManagerType;
  className?: string;
  accountType: AccountType;
  chainId?: ChainId;
  guardianIdentifier: string;
  onlyGetPin?: boolean;
  guardianApprovedList: GuardiansApproved[];
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onFinish?: (values: DIDWalletInfo | string) => void;
  onCreatePending?: (pendingInfo: CreatePendingInfo) => void;
}

export default function SetPinAndAddManager({
  type,
  chainId = 'AELF',
  className,
  onlyGetPin,
  accountType = 'Email',
  guardianIdentifier,
  guardianApprovedList,
  isErrorTip = true,
  onError,
  onFinish,
  onCreatePending,
}: SetPinAndAddManagerProps) {
  const onFinishRef = useRef<SetPinAndAddManagerProps['onFinish']>(onFinish);

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
    [onlyGetPin, type, chainId, accountType, guardianIdentifier, guardianApprovedList, createWallet],
  );

  return (
    <SetPinBase
      className={clsx('portkey-card-height', className)}
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
  );
}
