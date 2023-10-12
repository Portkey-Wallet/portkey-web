import { ChainId } from '@portkey/types';
import { memo, useCallback, ReactNode, useState, useRef } from 'react';
import { AccountTypeEnum, OperationTypeEnum, VerifierItem } from '@portkey/services';
import { useTranslation } from 'react-i18next';
import CustomSvg from '../CustomSvg';
import { ISocialLogin, IVerificationInfo, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../types';
import GuardianAccountShow from '../GuardianAccountShow';
import BaseVerifierIcon from '../BaseVerifierIcon';
import { Button, Switch } from 'antd';
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
import ConfigProvider from '../config-provider';
import clsx from 'clsx';
import './index.less';

export interface GuardianViewProps {
  header?: ReactNode;
  className?: string;
  originChainId?: ChainId;
  isErrorTip?: boolean;
  currentGuardian: UserGuardianStatus;
  guardianList?: UserGuardianStatus[];
  onError?: OnErrorFunc;
  onEditGuardian?: () => void;
  handleSetLoginGuardian: () => Promise<any>;
}

const guardianIconMap: any = {
  Email: 'Email',
  Phone: 'GuardianPhone',
  Google: 'GuardianGoogle',
  Apple: 'GuardianApple',
};

function GuardianView({
  header,
  className,
  originChainId = 'AELF',
  onEditGuardian,
  isErrorTip = true,
  currentGuardian,
  guardianList,
  handleSetLoginGuardian,
  onError,
}: GuardianViewProps) {
  const { t } = useTranslation();
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [switchDisable, setSwitchDisable] = useState<boolean>(false);
  const reCaptchaHandler = useReCaptchaModal();
  const verifyToken = useVerifyToken();
  const socialBasic = useCallback(
    (v: ISocialLogin) => {
      try {
        const socialLogin = ConfigProvider.config.socialLogin;
        let clientId;
        let redirectURI;
        let customLoginHandler;
        switch (v) {
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
        return { clientId, redirectURI, customLoginHandler };
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
      try {
        const { clientId, redirectURI, customLoginHandler } =
          socialBasic(_guardian?.guardianType as ISocialLogin) || {};
        const response = await socialLoginAuth({
          type: _guardian?.guardianType as ISocialLogin,
          clientId,
          redirectURI,
        });
        if (!response?.token) throw new Error('auth failed');
        const rst = await verifyToken(_guardian?.guardianType as ISocialLogin, {
          accessToken: response?.token,
          id: _guardian.guardianIdentifier || '',
          verifierId: _guardian?.verifier?.id || '',
          chainId: originChainId,
          clientId,
          redirectURI,
          operationType: OperationTypeEnum.addGuardian,
          customLoginHandler,
        });
        if (!rst) return;
        const verifierInfo: IVerificationInfo = { ...rst, verifierId: _guardian?.verifierId };
        const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);
        return { verifierInfo, guardianIdentifier };
      } catch (error) {
        return errorTip(
          {
            errorFields: 'Guardian Social Verify',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [socialBasic, verifyToken, originChainId, isErrorTip, onError],
  );
  const handleSwitch = useCallback(async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [handleSetLoginGuardian, isErrorTip, onError]);
  const sendCode = useCallback(async () => {
    try {
      setLoading(true);
      const _guardian = curGuardian.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId: originChainId,
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
    } finally {
      setLoading(false);
    }
  }, [originChainId, reCaptchaHandler, isErrorTip, onError]);
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
      try {
        setLoading(true);
        await socialVerify?.(currentGuardian);
        await handleSwitch();
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
  }, [currentGuardian, socialVerify, handleSwitch, isErrorTip, onError, sendCode]);

  const checkSwitch = useCallback(
    async (status: boolean) => {
      if (status) {
        const isLogin = Object.values(guardianList ?? {}).some(
          (item: UserGuardianStatus) =>
            item.isLoginGuardian && item.guardianIdentifier === currentGuardian?.guardianIdentifier,
        );
        if (isLogin) {
          await handleVerify();
          return;
        }
        try {
          setSwitchDisable(true);
          await did.getHolderInfo({
            chainId: originChainId,
            loginGuardianIdentifier: currentGuardian?.guardianIdentifier,
          });
          CustomModal({
            type: 'info',
            okText: 'Close',
            content: <>{t('This account address is already a login account and cannot be used')}</>,
          });
        } catch (error: any) {
          if (error?.error?.code?.toString() === '3002') {
            await handleVerify();
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
        } finally {
          setSwitchDisable(false);
        }
      } else {
        let loginAccountNum = 0;
        guardianList?.forEach((item) => {
          if (item.isLoginGuardian) loginAccountNum++;
        });
        if (loginAccountNum > 1) {
          await handleSwitch();
        } else {
          CustomModal({
            type: 'info',
            okText: 'Close',
            content: <>{t('This guardian is the only login account and cannot be turned off')}</>,
          });
        }
      }
    },
    [originChainId, currentGuardian, guardianList, handleSwitch, handleVerify, isErrorTip, onError, t],
  );
  const handleBackView = useCallback(() => {
    curGuardian.current = currentGuardian;
    setVerifierVisible(false);
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
                <CustomSvg type={guardianIconMap[currentGuardian?.guardianType || 'Email']} />
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
            <Button type="primary" className="guardian-btn" onClick={onEditGuardian}>
              {t('Edit')}
            </Button>
          </div>
        )}
      </>
      <CommonBaseModal open={verifierVisible} onClose={handleBackView}>
        <VerifierPage
          originChainId={originChainId}
          operationType={OperationTypeEnum.setLoginAccount}
          onBack={handleBackView}
          guardianIdentifier={curGuardian?.current?.guardianIdentifier || ''}
          verifierSessionId={curGuardian?.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={curGuardian?.current?.isLoginGuardian}
          isCountdownNow={curGuardian?.current?.isInitStatus}
          accountType={curGuardian?.current?.guardianType}
          isErrorTip={isErrorTip}
          verifier={curGuardian?.current?.verifier as VerifierItem}
          onSuccess={handleSwitch}
          onError={onError}
          onReSend={reSendCode}
        />
      </CommonBaseModal>
    </div>
  );
}
export default memo(GuardianView);
