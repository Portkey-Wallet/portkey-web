import { useState, useCallback, ReactNode, useRef, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import clsx from 'clsx';
import GuardianList from '../GuardianList/index.component';
import VerifierPage from './components/VerifierPage';
import { errorTip, handleErrorMessage, handleVerificationDoc, parseAppleIdentityToken, setLoading } from '../../utils';
import type { ChainId } from '@portkey/types';
import { HOUR, MINUTE, portkeyDidUIPrefix } from '../../constants';
import { BaseGuardianItem, UserGuardianStatus, VerifyStatus, OnErrorFunc, IVerificationInfo } from '../../types';
import type { GuardiansApproved } from '@portkey/services';
import { VerifierItem } from '@portkey/did';
import { useVerifyToken } from '../../hooks/authentication';
import ConfigProvider from '../config-provider';
import { did } from '../../utils';
import './index.less';

const GuardianListStorageKey = `${portkeyDidUIPrefix}GuardianListInfo`;
const getExpiredTime = () => Date.now() + HOUR - 2 * MINUTE;

export interface GuardianApprovalProps {
  header?: ReactNode;
  chainId: ChainId;
  className?: string;
  guardianList?: BaseGuardianItem[];
  isErrorTip?: boolean;
  appleIdToken?: string; // apple social login id token
  onError?: OnErrorFunc;
  onConfirm?: (guardianList: GuardiansApproved[]) => void;
}

const GuardianApproval = forwardRef(
  (
    { header, chainId, className, guardianList, isErrorTip, appleIdToken, onError, onConfirm }: GuardianApprovalProps,
    ref,
  ) => {
    const [verifyAccountIndex, setVerifyAccountIndex] = useState<number | undefined>();
    const [_guardianList, setGuardianList] = useState<UserGuardianStatus[]>(guardianList || []);
    const [expiredTime, setExpiredTime] = useState<number>();
    const onErrorRef = useRef<GuardianApprovalProps['onError']>(onError);
    const onConfirmRef = useRef<GuardianApprovalProps['onConfirm']>(onConfirm);

    const clearStorage = useCallback(() => {
      ConfigProvider.config.storageMethod?.removeItem(GuardianListStorageKey);
    }, []);

    useImperativeHandle(ref, () => ({ clearStorage }));

    useEffect(() => {
      onErrorRef.current = onError;
      onConfirmRef.current = onConfirm;
    });

    const getAppleApproved = useCallback(
      (guardianList: UserGuardianStatus[]) => {
        try {
          if (!appleIdToken) return;
          const { isExpired: tokenIsExpired, userId } = parseAppleIdentityToken(appleIdToken) || {};

          if (tokenIsExpired) return;
          // let matchUser = false;
          guardianList.forEach(async (item, index) => {
            if (item.identifier === userId || item.identifierHash === userId) {
              // matchUser = true;
              if (!item.verifier?.id) return;
              const result = await did.services.verifyAppleToken({
                verifierId: item.verifier?.id,
                chainId,
                identityToken: appleIdToken,
              });

              const verifierInfo: IVerificationInfo = { ...result, verifierId: item?.verifier?.id };
              const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);
              setVerifyAccountIndex(undefined);
              setGuardianList((v) => {
                v[index] = {
                  ...item,
                  identifier: userId,
                  ...verifierInfo,
                  identifierHash: guardianIdentifier,
                  status: VerifyStatus.Verified,
                };
                return [...v];
              });
            }
          });
          // if (!matchUser) throw 'appleIdToken does not match';
        } catch (error) {
          errorTip(
            {
              errorFields: 'getAppleApproved',
              error: handleErrorMessage(error),
            },
            isErrorTip,
            onErrorRef.current,
          );
        }
      },
      [appleIdToken, chainId, isErrorTip],
    );

    const getGuardianList = useCallback(async () => {
      try {
        const infoStr = await ConfigProvider.config.storageMethod?.getItem(GuardianListStorageKey);
        if (!infoStr) {
          guardianList?.length && !_guardianList.length && setGuardianList(guardianList);
          return;
        }
        const info: {
          expiredTime: number;
          guardianList: UserGuardianStatus[];
        } = JSON.parse(infoStr);
        const localGuardianList = info.guardianList;
        if (info.expiredTime <= Date.now()) {
          ConfigProvider.config.storageMethod?.removeItem(GuardianListStorageKey);
        }
        const guardianListTem: UserGuardianStatus[] = [];
        let isSameGuardian = true;
        guardianList?.forEach((item, index) => {
          if (item.identifier === localGuardianList[index].identifier) {
            const guardian = localGuardianList[index];
            guardianListTem.push(guardian);
          } else {
            isSameGuardian = false;
          }
        });
        if (!isSameGuardian) {
          setGuardianList(guardianList as UserGuardianStatus[]);
          getAppleApproved(guardianList as UserGuardianStatus[]);
          return;
        }
        setGuardianList(guardianListTem);
        getAppleApproved(guardianListTem);
      } catch (error) {
        // console.error(error, 'getGuardianList===');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAppleApproved, guardianList]);

    useEffect(() => {
      getGuardianList();
    }, [getGuardianList]);

    const onSendCodeHandler = useCallback(
      async (item: UserGuardianStatus, index: number) => {
        try {
          if (!expiredTime) setExpiredTime(getExpiredTime());

          setVerifyAccountIndex(index);
          setGuardianList((v) => {
            v[index] = {
              ...item,
              status: VerifyStatus.Verifying,
              isInitStatus: true,
            };

            return v;
          });
        } catch (error: any) {
          console.log(error, 'error===');
          return errorTip(
            {
              errorFields: 'GuardianApproval',
              error: error?.error?.message ?? error?.type ?? 'Something error',
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
          let clientId;
          let redirectURI;
          let storageInfo = '';
          let customLoginHandler;
          switch (item.guardianType) {
            case 'Apple':
              clientId = ConfigProvider.config.socialLogin?.Apple?.clientId;
              redirectURI = ConfigProvider.config.socialLogin?.Apple?.redirectURI;
              customLoginHandler = ConfigProvider.config.socialLogin?.Apple?.customLoginHandler;
              storageInfo = JSON.stringify({
                expiredTime: getExpiredTime(),
                guardianList: _guardianList,
              });
              ConfigProvider.config.storageMethod?.setItem(GuardianListStorageKey, storageInfo);
              break;
            case 'Google':
              clientId = ConfigProvider.config.socialLogin?.Google?.clientId;
              customLoginHandler = ConfigProvider.config.socialLogin?.Google?.customLoginHandler;
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
            clientId: clientId ?? '',
            redirectURI,
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
      [chainId, isErrorTip, _guardianList, onError, verifyToken],
    );

    const onVerifyingHandler = useCallback(
      async (_item: UserGuardianStatus, index: number) => {
        const isSocialLogin = _item.guardianType === 'Google' || _item.guardianType === 'Apple';
        if (isSocialLogin) return socialVerifyHandler(_item, index);

        try {
          setVerifyAccountIndex(index);
          setGuardianList((v) => {
            v[index].isInitStatus = false;
            return v;
          });
        } catch (error: any) {
          console.log(error, 'error===');
          return errorTip(
            {
              errorFields: 'GuardianApproval',
              error: error?.error?.message ?? error?.type ?? 'Something error',
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
          return v;
        });
        setVerifyAccountIndex(undefined);
      },
      [],
    );

    const onConfirmHandler = useCallback(() => {
      const verificationList = _guardianList
        .filter((item) => Boolean(item.signature && item.verificationDoc))
        .map((item) => ({
          type: item.guardianType,
          identifier: item.identifier || item.identifierHash || '',
          verifierId: item.verifier?.id || '',
          verificationDoc: item.verificationDoc || '',
          signature: item.signature || '',
        }));
      onConfirmRef.current?.(verificationList);
      ConfigProvider.config.storageMethod?.removeItem(GuardianListStorageKey);
    }, [_guardianList]);

    const onReSendVerifyHandler = useCallback(
      ({ verifierSessionId }: { verifier: VerifierItem; verifierSessionId: string }, verifyAccountIndex: number) => {
        setGuardianList((v) => {
          const list = { ...v };
          if (list[verifyAccountIndex]) {
            list[verifyAccountIndex].verifierInfo = { sessionId: verifierSessionId };
          } else {
            return list;
          }
          return list;
        });
      },
      [],
    );

    return (
      <div className={clsx('ui-guardian-approval-wrapper', className)}>
        {typeof verifyAccountIndex === 'number' ? (
          <VerifierPage
            chainId={chainId}
            onBack={() => setVerifyAccountIndex(undefined)}
            guardianIdentifier={_guardianList[verifyAccountIndex].identifier || ''}
            verifierSessionId={_guardianList[verifyAccountIndex].verifierInfo?.sessionId || ''}
            isLoginAccount={_guardianList[verifyAccountIndex].isLoginAccount}
            isCountdownNow={_guardianList[verifyAccountIndex].isInitStatus}
            accountType={_guardianList[verifyAccountIndex].guardianType}
            isErrorTip={isErrorTip}
            verifier={_guardianList[verifyAccountIndex].verifier as VerifierItem}
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
              guardianList={_guardianList}
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
