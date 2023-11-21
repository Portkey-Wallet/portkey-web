import { useState, useCallback, ReactNode, useRef, useEffect, memo, forwardRef } from 'react';
import clsx from 'clsx';
import GuardianList from '../GuardianList/index.component';
import VerifierPage from './components/VerifierPage';
import { errorTip, handleErrorMessage, handleVerificationDoc, setLoading } from '../../utils';
import type { ChainId } from '@portkey/types';
import { HOUR, MINUTE } from '../../constants';
import { BaseGuardianItem, UserGuardianStatus, VerifyStatus, OnErrorFunc, IVerificationInfo } from '../../types';
import { OperationTypeEnum, GuardiansApproved } from '@portkey/services';
import { TVerifyCodeInfo } from '../SignStep/types';
import { useVerifyToken } from '../../hooks/authentication';
import ConfigProvider from '../config-provider';
import { useUpdateEffect } from 'react-use';
import { TVerifierItem } from '../types';
import './index.less';

const getExpiredTime = () => Date.now() + HOUR - 2 * MINUTE;

export interface GuardianApprovalProps {
  header?: ReactNode;
  chainId: ChainId;
  className?: string;
  guardianList?: BaseGuardianItem[];
  isErrorTip?: boolean;
  wrapperStyle?: React.CSSProperties;
  operationType?: OperationTypeEnum;
  onError?: OnErrorFunc;
  onConfirm?: (guardianList: GuardiansApproved[]) => void;
  onGuardianListChange?: (guardianList: UserGuardianStatus[]) => void;
}

const GuardianApproval = forwardRef(
  (
    {
      header,
      chainId,
      className,
      guardianList: defaultGuardianList,
      isErrorTip = true,
      wrapperStyle,
      operationType = OperationTypeEnum.communityRecovery,
      onError,
      onConfirm,
      onGuardianListChange,
    }: GuardianApprovalProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
  ) => {
    const [verifyAccountIndex, setVerifyAccountIndex] = useState<number | undefined>();
    const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>([]);
    const [expiredTime, setExpiredTime] = useState<number>();
    const onErrorRef = useRef<GuardianApprovalProps['onError']>(onError);
    const onConfirmRef = useRef<GuardianApprovalProps['onConfirm']>(onConfirm);

    useEffect(() => {
      onErrorRef.current = onError;
      onConfirmRef.current = onConfirm;
    });

    useUpdateEffect(() => {
      onGuardianListChange?.(guardianList);
    }, [guardianList]);

    useEffect(() => {
      defaultGuardianList?.length && setGuardianList(defaultGuardianList);
    }, [defaultGuardianList]);

    const onSendCodeHandler = useCallback(
      async (item: UserGuardianStatus, index: number) => {
        try {
          if (!expiredTime) setExpiredTime(getExpiredTime());
          setGuardianList((v) => {
            v[index] = {
              ...item,
              status: VerifyStatus.Verifying,
              isInitStatus: true,
            };

            return [...v];
          });
          setVerifyAccountIndex(index);
        } catch (error: any) {
          console.error(error, 'error===');
          return errorTip(
            {
              errorFields: 'GuardianApproval',
              error: handleErrorMessage(error),
            },
            isErrorTip,
            onErrorRef?.current,
          );
        }
      },
      [expiredTime, isErrorTip],
    );

    const verifyToken = useVerifyToken();

    const socialVerifyHandler = useCallback(
      async (item: UserGuardianStatus, index: number) => {
        try {
          setLoading(true);
          const accessToken = item?.accessToken;
          const socialLogin = ConfigProvider.config.socialLogin;
          let clientId;
          let redirectURI;
          let customLoginHandler;
          switch (item.guardianType) {
            case 'Apple':
              clientId = socialLogin?.Apple?.clientId;
              redirectURI = socialLogin?.Apple?.redirectURI;
              customLoginHandler = socialLogin?.Apple?.customLoginHandler;

              break;
            case 'Google':
              clientId = socialLogin?.Google?.clientId;
              customLoginHandler = socialLogin?.Google?.customLoginHandler;
              break;
            default:
              throw 'accountType is not supported';
          }
          if (!item.verifier?.id) throw 'verifier id is not exist';
          const id = item.identifier || item.identifierHash;
          if (!id) throw 'identifier is not exist';
          const rst = await verifyToken(item.guardianType, {
            accessToken,
            id,
            verifierId: item.verifier?.id,
            chainId,
            clientId,
            redirectURI,
            operationType,
            customLoginHandler,
          });
          if (!rst && item.guardianType === 'Apple') return;

          const verifierInfo: IVerificationInfo = { ...rst, verifierId: item?.verifier?.id };
          const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);

          setGuardianList((v) => {
            v[index] = {
              ...v[index],
              status: VerifyStatus.Verified,
              verificationDoc: verifierInfo.verificationDoc,
              signature: verifierInfo.signature,
              identifierHash: guardianIdentifier,
            };
            return [...v];
          });
          setVerifyAccountIndex(undefined);
        } catch (error) {
          return errorTip(
            {
              errorFields: 'GuardianApproval',
              error: handleErrorMessage(error),
            },
            isErrorTip,
            onError,
          );
        } finally {
          setLoading(false);
        }
      },
      [chainId, isErrorTip, onError, operationType, verifyToken],
    );

    const onVerifyingHandler = useCallback(
      async (_item: UserGuardianStatus, index: number) => {
        const isSocialLogin = _item.guardianType === 'Google' || _item.guardianType === 'Apple';
        if (isSocialLogin) return socialVerifyHandler(_item, index);

        try {
          setVerifyAccountIndex(index);
          setGuardianList((v) => {
            v[index].isInitStatus = false;
            return [...v];
          });
        } catch (error: any) {
          return errorTip(
            {
              errorFields: 'GuardianApproval',
              error: handleErrorMessage(error, 'Something error'),
            },
            isErrorTip,
            onError,
          );
        }
      },
      [isErrorTip, onError, socialVerifyHandler],
    );

    const onCodeVerifyHandler = useCallback(
      (res: { verificationDoc: string; signature: string; verifierId: string }, index: number) => {
        setGuardianList((v) => {
          v[index] = {
            ...v[index],
            status: VerifyStatus.Verified,
            verificationDoc: res.verificationDoc,
            signature: res.signature,
          };
          return [...v];
        });
        setVerifyAccountIndex(undefined);
      },
      [],
    );

    const onConfirmHandler = useCallback(() => {
      const verificationList = guardianList
        .filter((item) => Boolean(item.signature && item.verificationDoc))
        .map((item) => ({
          type: item.guardianType,
          identifier: item.identifier || item.identifierHash || '',
          verifierId: item.verifier?.id || '',
          verificationDoc: item.verificationDoc || '',
          signature: item.signature || '',
        }));
      onConfirmRef.current?.(verificationList);
    }, [guardianList]);

    const onReSendVerifyHandler = useCallback(({ verifierSessionId }: TVerifyCodeInfo, verifyAccountIndex: number) => {
      setGuardianList((v) => {
        const list = [...v];
        if (list[verifyAccountIndex]) {
          list[verifyAccountIndex].verifierInfo = { sessionId: verifierSessionId };
        } else {
          return list;
        }
        return list;
      });
    }, []);

    return (
      <div style={wrapperStyle} className={clsx('ui-guardian-approval-wrapper', className)}>
        {typeof verifyAccountIndex === 'number' ? (
          <VerifierPage
            chainId={chainId}
            operationType={operationType}
            onBack={() => setVerifyAccountIndex(undefined)}
            guardianIdentifier={guardianList[verifyAccountIndex].identifier || ''}
            verifierSessionId={guardianList[verifyAccountIndex].verifierInfo?.sessionId || ''}
            isLoginGuardian={guardianList[verifyAccountIndex].isLoginGuardian}
            isCountdownNow={guardianList[verifyAccountIndex].isInitStatus}
            accountType={guardianList[verifyAccountIndex].guardianType}
            isErrorTip={isErrorTip}
            verifier={guardianList[verifyAccountIndex].verifier as TVerifierItem}
            onSuccess={(res) => onCodeVerifyHandler(res, verifyAccountIndex)}
            onError={onError}
            onReSend={(result) => onReSendVerifyHandler(result, verifyAccountIndex)}
          />
        ) : (
          <>
            {header}
            <GuardianList
              chainId={chainId}
              expiredTime={expiredTime}
              operationType={operationType}
              guardianList={guardianList}
              isErrorTip={isErrorTip}
              onSend={onSendCodeHandler}
              onVerifying={onVerifyingHandler}
              onConfirm={onConfirmHandler}
              onError={onError}
            />
          </>
        )}
      </div>
    );
  },
);

export default memo(GuardianApproval);
