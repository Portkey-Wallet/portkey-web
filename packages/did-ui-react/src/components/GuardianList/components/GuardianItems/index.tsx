import { Button } from 'antd';
import VerifierPair from '../../../VerifierPair';
import { useCallback, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setLoading, verification, errorTip, handleErrorMessage } from '../../../../utils';
import clsx from 'clsx';
import { ChainId } from '@portkey/types';
import { UserGuardianItem, UserGuardianStatus, VerifyStatus, OnErrorFunc } from '../../../../types';
import useReCaptchaModal from '../../../../hooks/useReCaptchaModal';

interface GuardianItemProps {
  chainId: ChainId;
  disabled?: boolean;
  isExpired?: boolean;
  item: UserGuardianStatus;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onSend?: (item: UserGuardianItem) => void;
  onVerifying?: (item: UserGuardianItem) => void;
}

function GuardianItems({
  chainId,
  disabled,
  item,
  isExpired,
  isErrorTip,
  onError,
  onSend,
  onVerifying,
}: GuardianItemProps) {
  const { t } = useTranslation();
  const isSocialLogin = useMemo(
    () => item.guardianType === 'Google' || item.guardianType === 'Apple',
    [item.guardianType],
  );

  const accountShow = useCallback((guardian: UserGuardianItem) => {
    switch (guardian.guardianType) {
      case 'Email':
      case 'Phone':
        return <div className="account-text">{guardian.identifier || guardian.identifierHash}</div>;
      case 'Google':
        return (
          <div className="account-text">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.thirdPartyEmail}</div>
          </div>
        );
      case 'Apple':
        return (
          <div className="account-text">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.isPrivate ? '******' : guardian.thirdPartyEmail}</div>
          </div>
        );
    }
  }, []);

  const reCaptchaHandler = useReCaptchaModal();

  const SendCode = useCallback(
    async (item: UserGuardianItem) => {
      try {
        const reCaptchaInfo = await reCaptchaHandler(true);
        if (reCaptchaInfo.type !== 'success') throw reCaptchaInfo;
        setLoading(true);
        const result = await verification.sendVerificationCode({
          params: {
            type: item.guardianType,
            guardianIdentifier: (item.identifier || item.identifierHash || '').replaceAll(/\s/g, ''),
            verifierId: item.verifier?.id || '',
            chainId,
          },
          headers: {
            reCaptchaToken: reCaptchaInfo.message,
          },
        });

        setLoading(false);
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
    [reCaptchaHandler, chainId, onSend, isErrorTip, onError],
  );

  const verifyingHandler = useCallback(
    async (item: UserGuardianItem) => {
      onVerifying?.(item);
    },
    [onVerifying],
  );

  return (
    <li className={clsx('flex-between-center verifier-item', disabled && 'verifier-item-disabled')}>
      {item.isLoginAccount && <div className="login-icon">{t('Login Account')}</div>}
      <div className="flex-between-center">
        <VerifierPair
          guardianType={item.guardianType}
          verifierSrc={item.verifier?.imageUrl}
          verifierName={item.verifier?.name}
        />
        {accountShow(item)}
      </div>
      {isExpired && item.status !== VerifyStatus.Verified ? (
        <Button className="expired" type="text" disabled>
          {t('Expired')}
        </Button>
      ) : (
        <>
          {(!item.status || item.status === VerifyStatus.NotVerified) && !isSocialLogin && (
            <Button className="not-verified" type="primary" onClick={() => SendCode(item)}>
              {t('Send')}
            </Button>
          )}
          {(item.status === VerifyStatus.Verifying || (!item.status && isSocialLogin)) && (
            <Button type="primary" className="verifying" onClick={() => verifyingHandler(item)}>
              {t('Verify')}
            </Button>
          )}
          {item.status === VerifyStatus.Verified && (
            <Button className="verified" type="text" disabled>
              {t('Confirmed')}
            </Button>
          )}
        </>
      )}
    </li>
  );
}

export default memo(GuardianItems);
