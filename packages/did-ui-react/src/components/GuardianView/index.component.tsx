import { ChainId } from '@portkey/types';
import { memo, useCallback, ReactNode, useState, useRef } from 'react';
import { AccountTypeEnum, OperationTypeEnum, VerifierItem } from '@portkey/services';
import { useTranslation } from 'react-i18next';
import CustomSvg from '../CustomSvg';
import { OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../types';
import GuardianAccountShow from '../GuardianAccountShow';
import BaseVerifierIcon from '../BaseVerifierIcon';
import { Button, Switch } from 'antd';
import VerifierPage from '../GuardianApproval/components/VerifierPage';
import { did, errorTip, handleErrorMessage, verification } from '../../utils';
import { useThrottleCallback } from '../../hooks/throttle';
import CustomModal from '../CustomModal';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import { TVerifyCodeInfo } from '../SignStep/types';
import CustomPromptModal from '../CustomPromptModal';
import './index.less';

export interface GuardianViewProps {
  header?: ReactNode;
  chainId?: ChainId;
  originChainId?: ChainId;
  editable?: boolean;
  isErrorTip?: boolean;
  currentGuardian: UserGuardianStatus;
  guardianList?: UserGuardianStatus[];
  onError?: OnErrorFunc;
  onEditGuardian?: () => void;
  handleSetLoginGuardian: () => Promise<any>;
  socialVerify?: (item: UserGuardianStatus) => Promise<any>;
}

const guardianIconMap: any = {
  Email: 'Email',
  Phone: 'GuardianPhone',
  Google: 'GuardianGoogle',
  Apple: 'GuardianApple',
};

function GuardianView({
  header,
  chainId = 'AELF',
  onEditGuardian,
  isErrorTip,
  currentGuardian,
  guardianList,
  handleSetLoginGuardian,
  onError,
  socialVerify,
}: GuardianViewProps) {
  const { t } = useTranslation();
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const reCaptchaHandler = useReCaptchaModal();
  console.log('===currentGuardian', currentGuardian);

  const handleSwitch = useCallback(async () => {
    try {
      await handleSetLoginGuardian();
      setVerifierVisible(false);
    } catch (e) {
      errorTip(
        {
          errorFields: 'Set Login Guardian',
          error: handleErrorMessage(e),
        },
        isErrorTip,
        onError,
      );
    }
  }, [handleSetLoginGuardian, isErrorTip, onError]);
  const sendCode = useCallback(async () => {
    try {
      const _guardian = curGuardian.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId,
            operationType: OperationTypeEnum.setLoginAccount,
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
    }
  }, [chainId, reCaptchaHandler, isErrorTip, onError]);
  const reSendCode = useCallback(({ verifierSessionId }: TVerifyCodeInfo) => {
    curGuardian.current = {
      ...(curGuardian.current as UserGuardianStatus),
      verifierInfo: {
        sessionId: verifierSessionId,
      },
    };
  }, []);
  const handleVerify = useCallback(async () => {
    if (
      [AccountTypeEnum[AccountTypeEnum.Google], AccountTypeEnum[AccountTypeEnum.Apple]].includes(
        currentGuardian.guardianType,
      )
    ) {
      await socialVerify?.(currentGuardian);
      handleSwitch();
    } else {
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
    }
  }, [currentGuardian, sendCode, socialVerify, handleSwitch]);

  const checkSwitch = useThrottleCallback(async (status: boolean) => {
    if (status) {
      const isLogin = Object.values(guardianList ?? {}).some(
        (item: UserGuardianStatus) =>
          item.isLoginGuardian && item.guardianIdentifier === currentGuardian?.guardianIdentifier,
      );
      if (isLogin) {
        handleVerify();
        return;
      }
      try {
        await did.getHolderInfo({
          chainId,
          loginGuardianIdentifier: currentGuardian?.guardianIdentifier,
        });
        CustomModal({
          type: 'info',
          okText: 'Close',
          content: <>{t('This account address is already a login account and cannot be used')}</>,
        });
      } catch (error: any) {
        if (error?.error?.code?.toString() === '3002') {
          handleVerify();
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
    } else {
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
    }
  }, []);
  return (
    <div className="portkey-ui-guardian-view portkey-ui-flex-column">
      <>
        {header}
        <div className="guardian-view-body portkey-ui-flex-column portkey-ui-flex-1">
          <div className="input-content portkey-ui-flex-column">
            <div className="input-item">
              <div className="input-item-label">{`Guardian ${currentGuardian.guardianType}`}</div>
              <div className="input-item-control portkey-ui-flex">
                <CustomSvg type={guardianIconMap[currentGuardian?.guardianType || 'Email']} />
                <GuardianAccountShow guardian={currentGuardian} />
              </div>
            </div>
            <div className="input-item">
              <div className="input-item-label">{t('Verifier')}</div>
              <div className="input-item-control portkey-ui-flex">
                <BaseVerifierIcon
                  src={currentGuardian?.verifier?.imageUrl}
                  fallback={currentGuardian?.verifier?.name[0]}
                />
                <span className="name">{currentGuardian?.verifier?.name ?? ''}</span>
              </div>
            </div>
          </div>
          <div className="login-content portkey-ui-flex-column">
            <span className="login-content-label">{t('Login account')}</span>
            <span className="login-content-value">
              {t('The login account will be able to log in and control all your assets')}
            </span>
            <div className="status-wrap">
              <Switch className="login-switch" checked={currentGuardian?.isLoginGuardian} onChange={checkSwitch} />
              <span className="status">{currentGuardian?.isLoginGuardian ? 'Open' : 'Close'}</span>
            </div>
          </div>
        </div>
        {onEditGuardian && (
          <div className="guardian-view-footer">
            <Button type="primary" className="guardian-btn" onClick={onEditGuardian}>
              {t('Edit')}
            </Button>
          </div>
        )}
      </>
      <CustomPromptModal open={verifierVisible} onClose={() => setVerifierVisible(false)}>
        <VerifierPage
          chainId={chainId}
          operationType={OperationTypeEnum.setLoginAccount}
          onBack={() => setVerifierVisible(false)}
          guardianIdentifier={currentGuardian?.guardianIdentifier || ''}
          verifierSessionId={curGuardian?.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={currentGuardian?.isLoginGuardian}
          isCountdownNow={currentGuardian?.isInitStatus}
          accountType={currentGuardian?.guardianType}
          isErrorTip={isErrorTip}
          verifier={currentGuardian?.verifier as VerifierItem}
          onSuccess={handleSwitch}
          onError={onError}
          onReSend={reSendCode}
        />
      </CustomPromptModal>
    </div>
  );
}
export default memo(GuardianView);
