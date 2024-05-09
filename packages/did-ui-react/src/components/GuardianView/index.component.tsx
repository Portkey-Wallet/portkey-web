import { ChainId } from '@portkey/types';
import { memo, useCallback, ReactNode, useState, useRef, useMemo } from 'react';
import { AccountTypeEnum, OperationTypeEnum, VerifierItem, GuardiansApproved } from '@portkey/services';
import { useTranslation } from 'react-i18next';
import {
  ISocialLogin,
  IVerificationInfo,
  NetworkType,
  OnErrorFunc,
  UserGuardianStatus,
  VerifyStatus,
} from '../../types';
import GuardianAccountShow from '../GuardianAccountShow';
import BaseVerifierIcon from '../BaseVerifierIcon';
import { Switch } from 'antd';
import VerifierPage from '../GuardianApproval/components/VerifierPage';
import {
  did,
  errorTip,
  handleErrorMessage,
  handleVerificationDoc,
  setLoading,
  socialLoginAuth,
  verification,
} from '../../utils';
import CustomModal from '../CustomModal';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import { TVerifyCodeInfo } from '../SignStep/types';
import CommonBaseModal from '../CommonBaseModal';
import { useVerifyToken } from '../../hooks';
import clsx from 'clsx';
import './index.less';
import { SocialLoginList, guardianIconMap } from '../../constants/guardian';
import GuardianApproval from '../GuardianApproval';
import BackHeader from '../BackHeader';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import { getSocialConfig } from '../utils/social.utils';
import GuardianTypeIcon from '../GuardianTypeIcon';

export interface GuardianViewProps {
  header?: ReactNode;
  className?: string;
  originChainId: ChainId;
  isErrorTip?: boolean;
  currentGuardian: UserGuardianStatus;
  guardianList?: UserGuardianStatus[];
  networkType: NetworkType;
  onError?: OnErrorFunc;
  onEditGuardian?: () => void;
  handleSetLoginGuardian: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
}

function GuardianView({
  header,
  className,
  originChainId,
  onEditGuardian,
  isErrorTip = true,
  currentGuardian,
  guardianList,
  networkType,
  handleSetLoginGuardian,
  onError,
}: GuardianViewProps) {
  const { t } = useTranslation();
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [switchDisable, setSwitchDisable] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const operationType = useMemo(
    () => (currentGuardian.isLoginGuardian ? OperationTypeEnum.unsetLoginAccount : OperationTypeEnum.setLoginAccount),
    [currentGuardian.isLoginGuardian],
  );

  const operationDetails = useMemo(() => getOperationDetails(operationType), [operationType]);

  const reCaptchaHandler = useReCaptchaModal();
  const verifyToken = useVerifyToken();
  const socialBasic = useCallback(
    (v: ISocialLogin) => {
      try {
        return getSocialConfig(v);
      } catch (error) {
        errorTip(
          {
            errorFields: 'get social account basic',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [isErrorTip, onError],
  );
  const socialVerify = useCallback(
    async (_guardian: UserGuardianStatus) => {
      const { clientId, redirectURI, customLoginHandler } = socialBasic(_guardian?.guardianType as ISocialLogin) || {};
      const response = await socialLoginAuth({
        type: _guardian?.guardianType as ISocialLogin,
        clientId,
        redirectURI,
        network: networkType,
        guardianIdentifier: _guardian.guardianIdentifier,
      });
      if (!response?.token) throw new Error('auth failed');
      const rst = await verifyToken(_guardian?.guardianType as ISocialLogin, {
        accessToken: response.token,
        id: _guardian.guardianIdentifier || '',
        verifierId: _guardian?.verifier?.id || '',
        chainId: originChainId,
        clientId,
        redirectURI,
        networkType,
        operationType,
        operationDetails,
        customLoginHandler,
      });
      if (!rst) return;
      const verifierInfo: IVerificationInfo = { ...rst, verifierId: _guardian?.verifierId };
      const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);
      return { verifierInfo, guardianIdentifier };
    },
    [socialBasic, verifyToken, originChainId, networkType, operationType, operationDetails],
  );

  const verifySuccess = useCallback((res: { verificationDoc: string; signature: string; verifierId: string }) => {
    const { guardianIdentifier } = handleVerificationDoc(res.verificationDoc);

    curGuardian.current = {
      ...(curGuardian?.current as UserGuardianStatus),
      status: VerifyStatus.Verified,
      verificationDoc: res.verificationDoc,
      signature: res.signature,
      identifierHash: guardianIdentifier,
    };
    setVerifierVisible(false);
    setApprovalVisible(true);
  }, []);

  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        await handleSetLoginGuardian?.({ ...curGuardian.current, ...currentGuardian }, approvalInfo);
        setApprovalVisible(false);
      } catch (e) {
        errorTip(
          {
            errorFields: 'Set Login Guardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [currentGuardian, handleSetLoginGuardian, isErrorTip, onError],
  );

  const sendCode = useCallback(async () => {
    try {
      setLoading(true);
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: currentGuardian?.guardianType || 'Email',
            guardianIdentifier: currentGuardian?.guardianIdentifier || '',
            verifierId: currentGuardian?.verifier?.id || '',
            chainId: originChainId,
            operationType,
          },
        },
        reCaptchaHandler,
      );

      if (result.verifierSessionId) {
        curGuardian.current = {
          ...(curGuardian.current as UserGuardianStatus),
          verifierInfo: {
            sessionId: result.verifierSessionId,
          },
          status: VerifyStatus.Verifying,
          isInitStatus: true,
        };
        setVerifierVisible(true);
      }
    } catch (error) {
      return errorTip(
        {
          errorFields: 'Send Code',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [currentGuardian, originChainId, operationType, reCaptchaHandler, isErrorTip, onError]);
  const reSendCode = useCallback(({ verifierSessionId }: TVerifyCodeInfo) => {
    curGuardian.current = {
      ...(curGuardian.current as UserGuardianStatus),
      verifierInfo: {
        sessionId: verifierSessionId,
      },
    };
  }, []);

  const handleCommonVerify = useCallback(() => {
    CustomModal({
      type: 'confirm',
      okText: 'Confirm',
      content: (
        <p>
          {`${currentGuardian?.verifier?.name ?? ''} will send a verification code to `}
          <strong>{currentGuardian?.guardianIdentifier}</strong>
          {` to verify your ${
            currentGuardian.guardianType === AccountTypeEnum[AccountTypeEnum.Phone] ? 'phone number' : 'email address'
          }.`}
        </p>
      ),
      onOk: sendCode,
    });
  }, [currentGuardian?.guardianIdentifier, currentGuardian.guardianType, currentGuardian?.verifier?.name, sendCode]);
  const handleSocialVerify = useCallback(async () => {
    try {
      setLoading(true);
      const res = await socialVerify?.(currentGuardian);

      curGuardian.current = {
        ...(curGuardian?.current as UserGuardianStatus),
        status: VerifyStatus.Verified,
        verificationDoc: res?.verifierInfo.verificationDoc,
        signature: res?.verifierInfo.signature,
        identifierHash: res?.guardianIdentifier,
      };
      setApprovalVisible(true);
    } catch (error) {
      errorTip(
        {
          errorFields: 'Social Verify',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [currentGuardian, isErrorTip, onError, socialVerify]);

  const handleSwitch = useCallback(() => {
    if (SocialLoginList.includes(currentGuardian.guardianType)) {
      handleSocialVerify();
    } else {
      handleCommonVerify();
    }
  }, [currentGuardian.guardianType, handleCommonVerify, handleSocialVerify]);

  const checkSetLoginGuardian = useCallback(async () => {
    setSwitchDisable(true);
    // step1
    const isLogin = Object.values(guardianList ?? {}).some(
      (item: UserGuardianStatus) =>
        item.isLoginGuardian && item.guardianIdentifier === currentGuardian?.guardianIdentifier,
    );
    if (isLogin) {
      setSwitchDisable(false);
      handleSwitch();
      return;
    }
    // step2
    try {
      await did.getHolderInfo({
        chainId: originChainId,
        loginGuardianIdentifier: currentGuardian?.guardianIdentifier,
      });
      setSwitchDisable(false);
      CustomModal({
        type: 'info',
        okText: 'Close',
        content: <>{t('This account address is already a login account and cannot be used')}</>,
      });
    } catch (error: any) {
      setSwitchDisable(false);
      if (error?.error?.code?.toString() === '3002') {
        handleSwitch();
      } else {
        errorTip(
          {
            errorFields: 'GetHolderInfo',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    }
  }, [currentGuardian?.guardianIdentifier, guardianList, handleSwitch, isErrorTip, onError, originChainId, t]);

  const checkUnsetLoginGuardian = useCallback(async () => {
    setSwitchDisable(true);
    let loginAccountNum = 0;
    guardianList?.forEach((item) => {
      if (item.isLoginGuardian) loginAccountNum++;
    });
    if (loginAccountNum > 1) {
      handleSwitch();
    } else {
      CustomModal({
        type: 'info',
        okText: 'Close',
        content: <>{t('This guardian is the only login account and cannot be turned off')}</>,
      });
    }
    setSwitchDisable(false);
  }, [guardianList, handleSwitch, t]);

  const checkSwitch = useCallback(
    async (status: boolean) => {
      if (status) {
        checkSetLoginGuardian();
      } else {
        checkUnsetLoginGuardian();
      }
    },
    [checkSetLoginGuardian, checkUnsetLoginGuardian],
  );
  const onCloseApproval = useCallback(() => {
    setVerifierVisible(false);
    setApprovalVisible(false);
  }, []);
  const handleBackView = useCallback(() => {
    curGuardian.current = currentGuardian;
    setVerifierVisible(false);
    setApprovalVisible(false);
  }, [currentGuardian]);
  return (
    <div className={clsx('portkey-ui-guardian-view', 'portkey-ui-flex-column', className)}>
      <>
        {header}
        <div className="guardian-view-body portkey-ui-flex-column portkey-ui-flex-1">
          <div className="guardian-view-input-content portkey-ui-flex-column">
            <div className="guardian-view-input-item">
              <div className="guardian-view-input-item-label">{`Guardian ${currentGuardian.guardianType}`}</div>
              <div className="guardian-view-input-item-control portkey-ui-flex">
                <GuardianTypeIcon type={guardianIconMap[currentGuardian?.guardianType || 'Email']} />
                <GuardianAccountShow guardian={currentGuardian} />
              </div>
            </div>
            <div className="guardian-view-input-item">
              <div className="guardian-view-input-item-label">{t('Verifier')}</div>
              <div className="guardian-view-input-item-control portkey-ui-flex">
                <BaseVerifierIcon
                  src={currentGuardian?.verifier?.imageUrl}
                  fallback={currentGuardian?.verifier?.name[0]}
                />
                <span className="name">{currentGuardian?.verifier?.name ?? ''}</span>
              </div>
            </div>
          </div>
          <div className="guardian-view-login-content portkey-ui-flex-column">
            <span className="guardian-view-login-content-label">{t('Login account')}</span>
            <span className="guardian-view-login-content-value">
              {t('The login account will be able to log in and control all your assets')}
            </span>
            <div className="guardian-view-switch-status-wrap">
              <Switch
                loading={switchDisable}
                className="guardian-view-switch-login-switch"
                checked={currentGuardian?.isLoginGuardian}
                onChange={checkSwitch}
              />
              <span className="guardian-view-switch-status">{currentGuardian?.isLoginGuardian ? 'Open' : 'Close'}</span>
            </div>
          </div>
        </div>
        {onEditGuardian && (
          <div className="guardian-view-footer">
            <ThrottleButton type="primary" className="guardian-btn" onClick={onEditGuardian}>
              {t('Edit')}
            </ThrottleButton>
          </div>
        )}
      </>
      <CommonBaseModal open={verifierVisible} onClose={handleBackView} destroyOnClose>
        <VerifierPage
          originChainId={originChainId}
          operationType={operationType}
          onBack={handleBackView}
          guardianIdentifier={currentGuardian.guardianIdentifier || ''}
          verifierSessionId={curGuardian.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={currentGuardian.isLoginGuardian}
          isCountdownNow={curGuardian.current?.isInitStatus}
          accountType={currentGuardian.guardianType}
          isErrorTip={isErrorTip}
          verifier={currentGuardian.verifier as VerifierItem}
          onSuccess={verifySuccess}
          onError={onError}
          onReSend={reSendCode}
        />
      </CommonBaseModal>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        destroyOnClose
        onClose={onCloseApproval}>
        <GuardianApproval
          header={<BackHeader onBack={onCloseApproval} />}
          operationDetails={operationDetails}
          originChainId={originChainId}
          guardianList={guardianList?.filter((item) => item.key !== currentGuardian.key)}
          networkType={networkType}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={operationType}
        />
      </CommonBaseModal>
    </div>
  );
}
export default memo(GuardianView);
