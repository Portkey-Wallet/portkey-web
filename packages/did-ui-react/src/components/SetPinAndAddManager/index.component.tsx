import { randomId, setLoading, errorTip, did, extraDataEncode } from '../../utils';
import { useCallback, useRef, useEffect } from 'react';
import SetPinBase from '../SetPinBase/index.component';
import clsx from 'clsx';
import { AddManagerType, CreatePendingInfo, DIDWalletInfo } from '../types';
import { OnErrorFunc } from '../../types';
import type { AccountType, GuardiansApproved } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { LoginResult, RegisterResult } from '@portkey/did';
import { RegisterStatusResult, RecoverStatusResult } from '@portkey/services';
import { DEVICE_TYPE, getDeviceInfo } from '../../constants/device';

export interface SetPinAndAddManagerProps {
  type: AddManagerType;
  className?: string;
  accountType?: AccountType;
  chainId?: ChainId;
  guardianIdentifier?: string;
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
  isErrorTip,
  onlyGetPin,
  accountType = 'Email',
  guardianIdentifier,
  guardianApprovedList,
  onError,
  onFinish,
  onCreatePending,
}: SetPinAndAddManagerProps) {
  const onErrorRef = useRef<SetPinAndAddManagerProps['onError']>(onError);
  const onFinishRef = useRef<SetPinAndAddManagerProps['onFinish']>(onFinish);

  useEffect(() => {
    onErrorRef.current = onError;
    onFinishRef.current = onFinish;
  });

  const getRequestStatus = useCallback(
    async ({ sessionId, chainId, type }: { sessionId: string; chainId: ChainId; type: AddManagerType }) => {
      let status, error: Error | undefined;
      try {
        if (type === 'register') {
          status = await did.didWallet.getRegisterStatus({
            sessionId,
            chainId,
          });
          const { registerStatus } = status;

          if (registerStatus !== 'pass') {
            throw new Error((status as RegisterStatusResult).registerMessage);
          }
        } else {
          status = await did.didWallet.getLoginStatus({ sessionId, chainId });
          const { recoveryStatus } = status;

          if (recoveryStatus !== 'pass') {
            throw new Error((status as RecoverStatusResult).recoveryMessage);
          }
        }
      } catch (e: any) {
        error = e;
      }
      return { sessionId, status, error };
    },
    [],
  );

  const requestRegisterWallet = useCallback(
    async (pin: string) => {
      if (!guardianIdentifier || !accountType) throw 'Missing account!!! Please login/register again';
      if (!guardianApprovedList?.length) throw 'Missing guardianApproved';
      const wallet = did.didWallet.create();
      const managerAddress = wallet.managementAccount!.address;
      const requestId = randomId();

      const clientId = managerAddress;

      const registerVerifier = guardianApprovedList[0];
      const extraData = await extraDataEncode(getDeviceInfo(DEVICE_TYPE), '');
      const params = {
        type: accountType,
        loginGuardianIdentifier: guardianIdentifier.replaceAll(/\s/g, ''),
        extraData,
        chainId,
        verifierId: registerVerifier.verifierId,
        verificationDoc: registerVerifier.verificationDoc,
        signature: registerVerifier.signature,
        context: {
          clientId,
          requestId,
        },
      };

      const { sessionId } = await did.services.register({
        ...params,
        manager: managerAddress,
      });
      onCreatePending?.({
        sessionId,
        requestId,
        clientId,
        pin,
        walletInfo: wallet.managementAccount!.wallet,
      });

      return getRequestStatus({
        chainId,
        sessionId,
        type: 'register',
      }) as Promise<RegisterResult>;
    },
    [guardianIdentifier, accountType, guardianApprovedList, chainId, onCreatePending, getRequestStatus],
  );

  const requestRecoveryWallet = useCallback(
    async (pin: string) => {
      if (!guardianIdentifier || !accountType) throw 'Missing account!!! Please login/register again';

      const wallet = did.didWallet.create();
      const managerAddress = wallet.managementAccount!.address;
      const requestId = randomId();

      const clientId = managerAddress;

      const extraData = await extraDataEncode(getDeviceInfo(DEVICE_TYPE), '');

      const _guardianApprovedList = guardianApprovedList.filter((item) =>
        Boolean(item.signature && item.verificationDoc),
      );

      const params = {
        loginGuardianIdentifier: guardianIdentifier.replaceAll(/\s/g, ''),
        guardiansApproved: _guardianApprovedList,
        extraData,
        chainId,
        context: {
          clientId,
          requestId,
        },
      };

      const { sessionId } = await did.services.recovery({
        ...params,
        manager: managerAddress,
      });

      onCreatePending?.({
        sessionId,
        requestId,
        clientId,
        pin,
        walletInfo: wallet.managementAccount!.wallet,
      });
      return getRequestStatus({
        chainId,
        sessionId,
        type: 'recovery',
      }) as Promise<LoginResult>;
    },
    [guardianIdentifier, accountType, guardianApprovedList, chainId, onCreatePending, getRequestStatus],
  );

  const onCreate = useCallback(
    async (pin: string) => {
      try {
        if (onlyGetPin) return onFinish?.(pin);
        if (!guardianIdentifier) throw 'Missing account!!!';
        did.reset();
        setLoading(true, 'Creating address on the chain...');

        let walletResult: RegisterResult | LoginResult;
        if (type === 'register') {
          walletResult = await requestRegisterWallet(pin);
        } else if (type === 'recovery') {
          walletResult = await requestRecoveryWallet(pin);
        } else {
          throw 'Param "type" error';
        }

        if (walletResult.error) {
          errorTip(
            {
              errorFields: 'SetPinAndAddManager',
              ...walletResult,
              error: walletResult.error,
            },
            isErrorTip,
            onErrorRef.current,
          );
          throw walletResult;
        }

        if (!walletResult.status?.caAddress || !walletResult.status?.caHash) {
          errorTip(
            {
              errorFields: 'SetPinAndAddManager',
              ...walletResult,
              error: 'Missing "caAddress" or "caHash"',
            },
            isErrorTip,
            onErrorRef.current,
          );
          throw walletResult;
        }

        onFinishRef?.current?.({
          caInfo: {
            caAddress: walletResult.status.caAddress,
            caHash: walletResult.status.caHash,
          },
          chainId,
          pin,
          walletInfo: did.didWallet.managementAccount!.wallet,
        });
      } catch (error: any) {
        setLoading(false);
        return errorTip(
          {
            errorFields: 'SetPinAndAddManager',
            error,
          },
          isErrorTip,
          onErrorRef.current,
        );
      } finally {
        setLoading(false);
      }
    },
    [onlyGetPin, onFinish, guardianIdentifier, type, isErrorTip, chainId, requestRegisterWallet, requestRecoveryWallet],
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
