import { useCallback, useEffect, useRef } from 'react';
import { AddManagerType, CreatePendingInfo } from '../components/types';
import { did, errorTip, extraDataEncode, handlerErrorTipLevel, randomId, setLoading } from '../utils';
import { LoginResult, RegisterResult } from '@portkey/did';
import { LoginStatusEnum } from '@portkey/types';
import { OnErrorFunc } from '../types';
import { ChainId } from '@portkey/types';
import { AccountType, GuardiansApproved, RecoverStatusResult, RegisterStatusResult } from '@portkey/services';
import { DEVICE_TYPE, getDeviceInfo } from '../constants/device';
import { LoadingText } from '../types/loading';

type onCreatePendingType = (pendingInfo: CreatePendingInfo) => void;

interface CreateWalletParams {
  pin: string;
  type: AddManagerType;
  chainId: ChainId;
  accountType: AccountType;
  guardianIdentifier: string;
  guardianApprovedList: GuardiansApproved[];
}

export function useLoginWallet({
  isErrorTip = true,
  onError,
  onCreatePending,
}:
  | {
      isErrorTip?: boolean;
      onCreatePending?: onCreatePendingType;
      onError?: OnErrorFunc;
    }
  | undefined = {}) {
  const onErrorRef = useRef<OnErrorFunc | undefined>(onError);
  const onCreatePendingRef = useRef<onCreatePendingType | undefined>(onCreatePending);

  useEffect(() => {
    onErrorRef.current = onError;
    onCreatePendingRef.current = onCreatePending;
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
            did.didWallet.updateLoginStatus(LoginStatusEnum.FAIL);
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
    async ({ pin, type, chainId, accountType, guardianIdentifier, guardianApprovedList }: CreateWalletParams) => {
      if (!guardianIdentifier || !accountType) throw 'Missing account!!! Please login/register again';
      if (!guardianApprovedList?.length) throw 'Missing guardianApproved';
      const wallet = did.didWallet;

      if (!wallet || !wallet.managementAccount?.address)
        throw 'ManagementAccount information is not detected, please initialize management information `did.create`';
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
        zkLoginInfo: registerVerifier.zkLoginInfo,
        context: {
          clientId,
          requestId,
        },
      };

      const { sessionId } = await did.services.register({
        ...params,
        manager: managerAddress,
      });
      onCreatePendingRef.current?.({
        sessionId,
        requestId,
        clientId,
        pin,
        createType: type,
        walletInfo: wallet.managementAccount!.wallet,
      });

      return getRequestStatus({
        chainId,
        sessionId,
        type: 'register',
      }) as Promise<RegisterResult>;
    },
    [getRequestStatus],
  );

  const requestRecoveryWallet = useCallback(
    async ({ pin, chainId, accountType, guardianIdentifier, guardianApprovedList, type }: CreateWalletParams) => {
      if (!guardianIdentifier || !accountType) throw 'Missing account!!! Please login/register again';

      const wallet = did.didWallet;
      if (!wallet || !wallet.managementAccount?.address)
        throw 'ManagementAccount information is not detected, please initialize management information `did.create`';
      const managerAddress = wallet.managementAccount!.address;
      const requestId = randomId();

      const clientId = managerAddress;

      const extraData = await extraDataEncode(getDeviceInfo(DEVICE_TYPE), '');

      const _guardianApprovedList = guardianApprovedList.filter((item) =>
        Boolean((item.signature && item.verificationDoc) || item.zkLoginInfo),
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

      const {
        sessionId,
        caAddress = '',
        caHash = '',
      } = await did.services.recovery({
        ...params,
        manager: managerAddress,
        source: 4, // SDK Type
      });

      did.didWallet.saveTempStatus({ chainId, caAddress, caHash, sessionId });

      onCreatePendingRef.current?.({
        sessionId,
        requestId,
        clientId,
        pin,
        createType: type,
        walletInfo: wallet.managementAccount!.wallet,
        didWallet: {
          caInfo: {
            caAddress,
            caHash,
          },
          accountInfo: {
            managerUniqueId: sessionId,
            guardianIdentifier,
            accountType,
            type: 'recovery',
          },
          createType: 'recovery',
          chainId,
          pin,
          walletInfo: wallet.managementAccount!.wallet,
        },
      });
      return getRequestStatus({
        chainId,
        sessionId,
        type: 'recovery',
      }) as Promise<LoginResult>;
    },
    [getRequestStatus],
  );

  const createWallet = useCallback(
    async ({ pin, type, chainId, accountType, guardianIdentifier, guardianApprovedList }: CreateWalletParams) => {
      try {
        if (!guardianIdentifier) throw 'Missing account!!!';

        const loadingText = type === 'recovery' ? LoadingText.InitiatingRecovery : LoadingText.CreateWallet;
        if (!did.didWallet.managementAccount) {
          handlerErrorTipLevel(`Management information not detected, please "did.create" before`, 'throwError');
        }
        setLoading(true, loadingText);

        let walletResult: RegisterResult | LoginResult;
        const walletParams = {
          pin,
          type,
          chainId,
          accountType,
          guardianIdentifier,
          guardianApprovedList,
        };
        if (type === 'register') {
          walletResult = await requestRegisterWallet(walletParams);
        } else if (type === 'recovery') {
          walletResult = await requestRecoveryWallet(walletParams);
        } else {
          throw 'Param "type" error';
        }

        if (walletResult.error) {
          errorTip(
            {
              errorFields: 'createWallet',
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
              errorFields: 'createWallet',
              ...walletResult,
              error: 'Missing "caAddress" or "caHash"',
            },
            isErrorTip,
            onErrorRef.current,
          );
          throw walletResult;
        }
        const wallet = did.didWallet.managementAccount!.wallet;
        setLoading(false);
        return {
          caInfo: {
            caAddress: walletResult.status.caAddress,
            caHash: walletResult.status.caHash,
          },
          accountInfo: {
            managerUniqueId: walletResult.sessionId,
            guardianIdentifier,
            accountType,
            type,
          },
          createType: type,
          chainId,
          pin,
          walletInfo: wallet,
        };
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
      }
    },
    [requestRegisterWallet, requestRecoveryWallet, isErrorTip],
  );

  return createWallet;
}
