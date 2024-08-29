import VerifierPair from '../../../VerifierPair';
import { useCallback, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setLoading, verification, errorTip, handleErrorMessage } from '../../../../utils';
import clsx from 'clsx';
import { ChainId, TStringJSON } from '@portkey/types';
import { UserGuardianItem, UserGuardianStatus, VerifyStatus, OnErrorFunc } from '../../../../types';
import useReCaptchaModal from '../../../../hooks/useReCaptchaModal';
import { OperationTypeEnum } from '@portkey/services';
import { SocialLoginList } from '../../../../constants/guardian';
import ThrottleButton from '../../../ThrottleButton';

interface GuardianItemProps {
  originChainId?: ChainId;
  targetChainId?: ChainId;
  disabled?: boolean;
  isExpired?: boolean;
  item: UserGuardianStatus;
  isErrorTip?: boolean;
  operationType?: OperationTypeEnum;
  operationDetails?: TStringJSON;
  onError?: OnErrorFunc;
  onSend?: (item: UserGuardianItem) => void;
  onVerifying?: (item: UserGuardianItem) => void;
}

function GuardianItems({
  originChainId = 'AELF',
  targetChainId,
  disabled,
  item,
  isExpired,
  isErrorTip = true,
  operationType = OperationTypeEnum.communityRecovery,
  operationDetails,
  onError,
  onSend,
  onVerifying,
}: GuardianItemProps) {
  const { t } = useTranslation();
  const isSocialLogin = useMemo(() => SocialLoginList.includes(item.guardianType), [item.guardianType]);

  const accountShow = useCallback((guardian: UserGuardianItem) => {
    switch (guardian.guardianType) {
      case 'Email':
      case 'Phone':
        return <div className="account-text account-text-one-row">{guardian.identifier}</div>;
      case 'Google':
        return (
          <div className="account-text account-text-two-row">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.thirdPartyEmail}</div>
          </div>
        );
      case 'Apple':
      case 'Telegram':
      case 'Twitter':
      case 'Facebook':
        return (
          <div className="account-text account-text-two-row">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.isPrivate ? '******' : guardian.thirdPartyEmail || '******'}</div>
          </div>
        );
    }
  }, []);

  const reCaptchaHandler = useReCaptchaModal();

  const SendCode = useCallback(
    async (item: UserGuardianItem) => {
      try {
        const result = await verification.sendVerificationCode(
          {
            params: {
              type: item.guardianType,
              guardianIdentifier: (item.identifier || item.identifierHash || '').replaceAll(/\s/g, ''),
              verifierId: item.verifier?.id || '',
              chainId: originChainId,
              targetChainId,
              operationType,
              operationDetails,
            },
          },
          reCaptchaHandler,
        );

        if (result.verifierSessionId) {
          onSend?.({
            ...item,
            verifierInfo: {
              sessionId: result.verifierSessionId,
            },
          });
        }
      } catch (error: any) {
        console.error(error, 'SendCode error:');
        setLoading(false);
        return errorTip(
          {
            errorFields: 'GuardianItems',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [originChainId, targetChainId, operationType, operationDetails, reCaptchaHandler, onSend, isErrorTip, onError],
  );

  const verifyingHandler = useCallback(
    async (item: UserGuardianItem) => {
      onVerifying?.(item);
    },
    [onVerifying],
  );

  return (
    <li className={clsx('portkey-ui-flex-between-center verifier-item', disabled && 'verifier-item-disabled')}>
      {item.isLoginGuardian && <div className="login-icon">{t('Login Account')}</div>}
      <div className="portkey-ui-w-100 portkey-ui-flex-between-center">
        <VerifierPair
          guardian={item}
          guardianType={item.guardianType}
          verifierSrc={item.verifier?.imageUrl}
          verifierName={item.verifier?.name}
        />
        {accountShow(item)}
      </div>
      {isExpired && item.status !== VerifyStatus.Verified ? (
        <ThrottleButton className="expired" type="text" disabled>
          {t('Expired')}
        </ThrottleButton>
      ) : (
        <>
          {(!item.status || item.status === VerifyStatus.NotVerified) && !isSocialLogin && (
            <ThrottleButton className="not-verified" type="primary" onClick={() => SendCode(item)}>
              {t('Send')}
            </ThrottleButton>
          )}
          {(item.status === VerifyStatus.Verifying || (!item.status && isSocialLogin)) && (
            <ThrottleButton type="primary" className="verifying" onClick={() => verifyingHandler(item)}>
              {t('Verify')}
            </ThrottleButton>
          )}
          {item.status === VerifyStatus.Verified && (
            <ThrottleButton className="verified" type="text" disabled>
              {t('Confirmed')}
            </ThrottleButton>
          )}
        </>
      )}
    </li>
  );
}

export default memo(GuardianItems);
