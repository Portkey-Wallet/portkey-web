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
  modalMethod,
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
  ISocialLogin,
  ITelegramInfo,
  IApproveDetail,
} from '../../types';
import { OperationTypeEnum, GuardiansApproved } from '@portkey/services';
import { TVerifyCodeInfo } from '../SignStep/types';
import { useVerifyToken } from '../../hooks/authentication';
import { useUpdateEffect } from 'react-use';
import { TVerifierItem } from '../types';
import { KEY_SHOW_WARNING, SHOW_WARNING_DIALOG, AllSocialLoginList, zkGuardianType } from '../../constants/guardian';
import { getSocialConfig } from '../utils/social.utils';
import './index.less';
import { Open_Login_Bridge } from '../../constants/telegram';
import { getCustomNetworkType, getStorageInstance } from '../config-provider/utils';

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
  telegramInfo?: ITelegramInfo;
  caHash?: string;
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
      telegramInfo,
      caHash,
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

    const socialVerifyHandler = useCallback(
      async (item: UserGuardianStatus, index: number) => {
        try {
          const accountType = item.guardianType as ISocialLogin;
          const accessToken =
            accountType === 'Telegram' && telegramInfo?.userId === item.guardianIdentifier && telegramInfo?.accessToken
              ? telegramInfo.accessToken
              : item.accessToken;
          const { clientId, redirectURI, customLoginHandler } = getSocialConfig(accountType);
          if (!item.verifier?.id) throw 'verifier id is not exist';
          const id = item.identifier || item.identifierHash;
          if (!id) throw 'identifier is not exist';
          const isFirstShowWarning = await getStorageInstance().getItem(KEY_SHOW_WARNING);
          const zkInfo = zkGuardianType.includes(item.guardianType)
            ? {
                idToken: item.zkLoginInfo?.jwt,
                nonce: item.zkLoginInfo?.nonce,
                timestamp: item.zkLoginInfo?.timestamp,
              }
            : {};
          if (isFirstShowWarning !== SHOW_WARNING_DIALOG && !accessToken) {
            const isConfirm = await modalMethod({
              width: 320,
              title: <div className="security-notice">Security Notice</div>,
              closable: false,
              wrapClassName: 'warning-modal-wrapper',
              className: `portkey-ui-common-modals ` + 'confirm-return-modal',
              content: (
                <p className="modal-content-v2">
                  You&rsquo;ll be directed to{' '}
                  <span className="official-website">{Open_Login_Bridge[getCustomNetworkType()][networkType]}</span> for
                  verification. If the site you land on doesn&rsquo;t match this link,please exercise caution and
                  refrain from taking any actions.
                </p>
              ),
            });
            if (!isConfirm) return;
            getStorageInstance().setItem(KEY_SHOW_WARNING, SHOW_WARNING_DIALOG);
          }
          setLoading(true);

          const approveDetail: IApproveDetail = {
            guardian: {
              guardianType: item.guardianType,
              identifier: item.identifier,
              thirdPartyEmail: item.thirdPartyEmail,
            },
            originChainId,
            targetChainId,
            symbol: officialWebsiteShow?.symbol,
            amount: officialWebsiteShow?.amount,
            operationType,
          };

          const rst = await verifyToken(accountType, {
            accessToken,
            ...zkInfo,
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
            approveDetail: approveDetail,
            caHash,
          });

          if (!rst || !(rst.verificationDoc || rst.zkLoginInfo)) return;

          const verifierInfo: IVerificationInfo = { ...rst, verifierId: item?.verifier?.id };

          const guardianIdentifier = rst.zkLoginInfo
            ? rst.zkLoginInfo.identifierHash
            : handleVerificationDoc(verifierInfo.verificationDoc as string).guardianIdentifier;

          setGuardianList((v) => {
            v[index] = {
              ...v[index],
              status: VerifyStatus.Verified,
              verificationDoc: verifierInfo.verificationDoc,
              signature: verifierInfo.signature,
              identifierHash: guardianIdentifier,
              zkLoginInfo: rst.zkLoginInfo,
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
      [
        telegramInfo?.userId,
        telegramInfo?.accessToken,
        originChainId,
        targetChainId,
        officialWebsiteShow?.symbol,
        officialWebsiteShow?.amount,
        operationType,
        verifyToken,
        networkType,
        operationDetails,
        caHash,
        isErrorTip,
        onError,
      ],
    );

    const onVerifyingHandler = useCallback(
      async (_item: UserGuardianStatus, index: number) => {
        const isSocialLogin = AllSocialLoginList.includes(_item.guardianType);
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
      [socialVerifyHandler, isErrorTip, onError],
    );

    const onCodeVerifyHandler = useCallback(
      (res: { verificationDoc?: string; signature?: string; verifierId: string }, index: number) => {
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
          .filter((item) => Boolean((item.signature && item.verificationDoc) || item.zkLoginInfo))
          .map((item) => ({
            type: item.guardianType,
            identifier: item.identifier || item.identifierHash || '',
            verifierId: item.verifier?.id || '',
            verificationDoc: item.verificationDoc || '',
            signature: item.signature || '',
            identifierHash: item.identifierHash || '',
            zkLoginInfo: item.zkLoginInfo,
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
              caHash={caHash}
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
