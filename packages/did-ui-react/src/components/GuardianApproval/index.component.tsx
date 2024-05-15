import {
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import type { SetStateAction, Dispatch } from 'react';
import clsx from 'clsx';
import GuardianList from '../GuardianList/index.component';
import VerifierPage from './components/VerifierPage';
import {
  errorTip,
  getAlreadyApprovalLength,
  getApprovalCount,
  handleErrorMessage,
  handleVerificationDoc,
  setLoading,
} from '../../utils';
import type { ChainId, TStringJSON } from '@portkey/types';
import { HOUR, MINUTE } from '../../constants';
import {
  BaseGuardianItem,
  UserGuardianStatus,
  VerifyStatus,
  OnErrorFunc,
  IVerificationInfo,
  NetworkType,
} from '../../types';
import { OperationTypeEnum, GuardiansApproved, VerifyVerificationCodeResult } from '@portkey/services';
import { TVerifyCodeInfo } from '../SignStep/types';
import { useVerifyToken } from '../../hooks/authentication';
import ConfigProvider from '../config-provider';
import { useUpdateEffect } from 'react-use';
import { TVerifierItem } from '../types';
import { SocialLoginList, OfficialWebsite, KEY_SHOW_WARNING, SHOW_WARNING_DIALOG } from '../../constants/guardian';
import './index.less';
import CommonModal from '../CommonModal';
import { Button } from 'antd';
import officialWebsiteCheck from '../../utils/officialWebsiteCheck';
import { did } from '@portkey/did';
import ThrottleButton from '../ThrottleButton';

const getExpiredTime = () => Date.now() + HOUR - 2 * MINUTE;

export interface GuardianApprovalProps {
  header?: ReactNode;
  originChainId: ChainId;
  targetChainId?: ChainId;
  className?: string;
  guardianList?: BaseGuardianItem[];
  isErrorTip?: boolean;
  wrapperStyle?: React.CSSProperties;
  operationType: OperationTypeEnum;
  operationDetails?: TStringJSON;
  officialWebsiteShow?: {
    amount?: string;
    symbol?: string;
  };
  networkType: NetworkType;
  // guardianIdentifier?: string; // for show (email)
  // firstName?: string; // for show (social)
  onError?: OnErrorFunc;
  onConfirm?: (guardianList: GuardiansApproved[]) => Promise<void>;
  onGuardianListChange?: (guardianList: UserGuardianStatus[]) => void;
}

export interface IGuardianApprovalInstance {
  setVerifyAccountIndex: Dispatch<SetStateAction<number | undefined>>;
}

const GuardianApprovalMain = forwardRef(
  (
    {
      header,
      originChainId,
      targetChainId,
      className,
      guardianList: defaultGuardianList,
      networkType,
      isErrorTip = true,
      wrapperStyle,
      operationType,
      operationDetails = '{}',
      officialWebsiteShow,
      // guardianIdentifier,
      // firstName,
      onError,
      onConfirm,
      onGuardianListChange,
    }: GuardianApprovalProps,
    ref,
  ) => {
    const [verifyAccountIndex, setVerifyAccountIndex] = useState<number | undefined>();
    const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>([]);
    const [expiredTime, setExpiredTime] = useState<number>();
    const onErrorRef = useRef<GuardianApprovalProps['onError']>(onError);
    const onConfirmRef = useRef<GuardianApprovalProps['onConfirm']>(onConfirm);
    const [isShowWarning, setShowWarning] = useState<boolean>(false);
    const currentVerifyingGuardian = useRef<any>();

    useEffect(() => {
      onErrorRef.current = onError;
      onConfirmRef.current = onConfirm;
    });

    useImperativeHandle(ref, () => ({ setVerifyAccountIndex }));

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

    const verifyResultHandler = useCallback(
      async (item: UserGuardianStatus, index: number, rst: VerifyVerificationCodeResult) => {
        try {
          setLoading(true);
          if (!rst || !rst.verificationDoc) return;

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
      [isErrorTip, onError],
    );
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
            case 'Telegram':
              customLoginHandler = socialLogin?.Telegram?.customLoginHandler;
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
            chainId: originChainId,
            targetChainId,
            clientId,
            redirectURI,
            operationType,
            networkType,
            operationDetails,
            customLoginHandler,
          });
          if (!rst || !rst.verificationDoc) return;

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
      [verifyToken, originChainId, targetChainId, operationType, networkType, operationDetails, isErrorTip, onError],
    );

    const onVerifyingHandler = useCallback(
      async (_item: UserGuardianStatus, index: number) => {
        const isSocialLogin = SocialLoginList.includes(_item.guardianType);
        if (isSocialLogin) {
          const isFirstShowWarning = await did.config.storageMethod.getItem(KEY_SHOW_WARNING);
          if (isFirstShowWarning !== SHOW_WARNING_DIALOG) {
            currentVerifyingGuardian.current = {
              item: _item,
              index: index,
            };
            await did.config.storageMethod.setItem(KEY_SHOW_WARNING, SHOW_WARNING_DIALOG);
            return setShowWarning(true);
          } else {
            try {
              const rst = await officialWebsiteCheck(
                _item,
                originChainId,
                operationType,
                // guardianType,
                targetChainId,
                officialWebsiteShow?.symbol,
                officialWebsiteShow?.amount,
                operationDetails,
              );
              console.log('rst===', rst);
              return verifyResultHandler(_item, index, rst as VerifyVerificationCodeResult);
            } catch (error) {
              return errorTip(
                {
                  errorFields: 'GuardianApproval',
                  error: handleErrorMessage(error),
                },
                isErrorTip,
                onError,
              );
            }
          }
        }

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
      [
        originChainId,
        operationType,
        targetChainId,
        officialWebsiteShow?.symbol,
        officialWebsiteShow?.amount,
        operationDetails,
        verifyResultHandler,
        isErrorTip,
        onError,
      ],
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

    const onConfirmHandler = useCallback(async () => {
      setFetching(true);
      try {
        const verificationList = guardianList
          .filter((item) => Boolean(item.signature && item.verificationDoc))
          .map((item) => ({
            type: item.guardianType,
            identifier: item.identifier || item.identifierHash || '',
            verifierId: item.verifier?.id || '',
            verificationDoc: item.verificationDoc || '',
            signature: item.signature || '',
            identifierHash: item.identifierHash || '',
          }));
        await onConfirmRef.current?.(verificationList);
        setFetching(false);
      } catch (error) {
        console.error(handleErrorMessage(error));
        setFetching(false);
      }

      setFetching(false);
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

    const approvalLength = useMemo(() => getApprovalCount(guardianList.length), [guardianList.length]);

    const alreadyApprovalLength = useMemo(() => getAlreadyApprovalLength(guardianList), [guardianList]);

    const [isFetching, setFetching] = useState<boolean>(false);

    useUpdateEffect(() => {
      const disabled = alreadyApprovalLength <= 0 || alreadyApprovalLength !== approvalLength;
      if (!disabled) {
        onConfirmHandler();
      }
    }, [approvalLength, alreadyApprovalLength]);

    return (
      <div>
        <CommonModal
          type="modal"
          closable={false}
          open={isShowWarning}
          className="confirm-return-modal"
          title={<div className="security-notice">Security Notice</div>}
          width={320}
          getContainer={'#set-pin-wrapper'}>
          <p className="modal-content-v2">
            You&rsquo;ll be directed to <span className="official-website">{OfficialWebsite}</span> for verification. If
            the site you land on doesn&rsquo;t match this link,please exercise caution and refrain from taking any
            actions.
          </p>
          {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}> */}
          <div className="btn-warning-wrapper">
            <ThrottleButton className="btn-cancel" onClick={() => setShowWarning(false)}>
              Cancel
            </ThrottleButton>
            <ThrottleButton
              className="btn-confirm"
              type="primary"
              onClick={async () => {
                try {
                  const currentGuardian = currentVerifyingGuardian.current;
                  currentVerifyingGuardian.current = undefined;
                  const rst = await officialWebsiteCheck(
                    currentGuardian?.item,
                    originChainId,
                    operationType,
                    // guardianType,
                    targetChainId,
                    officialWebsiteShow?.symbol,
                    officialWebsiteShow?.amount,
                    operationDetails,
                    // guardianIdentifier,
                    // firstName,
                  );
                  setShowWarning(false);
                  console.log('rst===', rst);
                  return verifyResultHandler(
                    currentGuardian?.item,
                    currentGuardian?.index,
                    rst as VerifyVerificationCodeResult,
                  );
                } catch (error) {
                  return errorTip(
                    {
                      errorFields: 'GuardianApproval',
                      error: handleErrorMessage(error),
                    },
                    isErrorTip,
                    onError,
                  );
                }
              }}>
              Proceed
            </ThrottleButton>
          </div>
          {/* </div> */}
        </CommonModal>
        <div style={wrapperStyle} className={clsx('ui-guardian-approval-wrapper', className)}>
          {typeof verifyAccountIndex === 'number' ? (
            <VerifierPage
              targetChainId={targetChainId}
              originChainId={originChainId}
              operationType={operationType}
              operationDetails={operationDetails}
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
                originChainId={originChainId}
                targetChainId={targetChainId}
                expiredTime={expiredTime}
                operationType={operationType}
                isFetching={isFetching}
                approvalLength={approvalLength}
                alreadyApprovalLength={alreadyApprovalLength}
                guardianList={guardianList}
                isErrorTip={isErrorTip}
                operationDetails={operationDetails}
                onSend={onSendCodeHandler}
                onVerifying={onVerifyingHandler}
                onConfirm={onConfirmHandler}
                onError={onError}
              />
            </>
          )}
        </div>
      </div>
    );
  },
);

export default memo(GuardianApprovalMain);
