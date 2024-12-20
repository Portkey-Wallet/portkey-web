import { useTranslation } from 'react-i18next';
import { useState, useEffect, memo, useMemo } from 'react';
import clsx from 'clsx';
import GuardianItems from './components/GuardianItems';
import { ChainId } from '@portkey/types';
import { UserGuardianStatus, VerifyStatus, OnErrorFunc } from '../../types';
import { OperationTypeEnum } from '@portkey/services';
import './index.less';
import { TStringJSON } from '@portkey/types';
import CommonButton from '../CommonButton';
import ProgressLine from '../LineProgress';
import CustomSvg from '../CustomSvg';
import { Loading } from '..';

export interface GuardianListProps {
  originChainId: ChainId;
  targetChainId?: ChainId;
  className?: string;
  guardianList?: UserGuardianStatus[];
  expiredTime?: number;
  isErrorTip?: boolean;
  approvalLength: number;
  alreadyApprovalLength: number;
  operationType?: OperationTypeEnum;
  operationDetails?: TStringJSON;
  isFetching: boolean;
  onError?: OnErrorFunc;
  onConfirm?: () => void;
  onSend?: (item: UserGuardianStatus, index: number) => void;
  onVerifying?: (item: UserGuardianStatus, index: number) => void;
  onAsyncVerifying?: (item: UserGuardianStatus, index: number) => void;
  onExpiredRetry?: () => void;
  onExpiredCancel?: () => void;
}

function GuardianList({
  originChainId,
  targetChainId,
  className,
  guardianList = [],
  expiredTime,
  isErrorTip = true,
  operationType = OperationTypeEnum.communityRecovery,
  approvalLength,
  alreadyApprovalLength,
  operationDetails,
  onError,
  onSend,
  onVerifying,
  onAsyncVerifying,
  onExpiredRetry,
  onExpiredCancel,
}: GuardianListProps) {
  const { t } = useTranslation();

  const [isExpired, setIsExpired] = useState<boolean>(false);
  const loginGuardians = useMemo(() => guardianList.filter((item) => item.isLoginGuardian), [guardianList]);
  const otherGuardians = useMemo(() => guardianList.filter((item) => !item.isLoginGuardian), [guardianList]);

  useEffect(() => {
    if (!expiredTime) return setIsExpired(false);
    const timeGap = (expiredTime ?? 0) - Date.now();
    if (timeGap <= 0) return setIsExpired(true);

    const timer = setInterval(() => {
      const timeGap = (expiredTime ?? 0) - Date.now();
      if (timeGap <= 0) return setIsExpired(true);
      setIsExpired(false);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [expiredTime]);

  const renderGuardianList = useMemo(() => {
    return (
      <div className="guardian-list-content">
        <div className="guardian-list-title">{t('Guardian Approval')}</div>
        <div className="guardian-list-description">
          {t('Complete the required guardian approvals below. Note: approvals expire after 1 hour.')}
        </div>
        <div className="guardian-list-progress">
          <div className="portkey-ui-flex-row-center">
            <span>{`${alreadyApprovalLength} / ${approvalLength} completed`}</span>
            {alreadyApprovalLength === approvalLength ? <CustomSvg type="selected" /> : null}
          </div>
          <ProgressLine percent={Math.round((alreadyApprovalLength / approvalLength) * 100)} />
        </div>
        {alreadyApprovalLength === approvalLength ? (
          <div className="portkey-ui-flex-center confirm-loading">
            <Loading width={32} height={32} />
          </div>
        ) : (
          <div className="guardian-list-list">
            {loginGuardians.length > 0 && <div className="login-guardians-text">{`Login account(s)`}</div>}
            {loginGuardians.map((item, index) => (
              <GuardianItems
                originChainId={originChainId}
                targetChainId={targetChainId}
                key={item.key}
                operationType={operationType}
                operationDetails={operationDetails}
                disabled={alreadyApprovalLength >= approvalLength && item.status !== VerifyStatus.Verified}
                isExpired={isExpired}
                item={item}
                isErrorTip={isErrorTip}
                onError={onError}
                onSend={(res) => onSend?.(res, index)}
                onVerifying={(res) => onVerifying?.(res, index)}
                onAsyncVerifying={(res) => onAsyncVerifying?.(res, index)}
              />
            ))}
            {otherGuardians.length ? (
              <>
                <div className="other-guardians-text">{`Other account(s)`}</div>
                {otherGuardians.map((item, index) => (
                  <GuardianItems
                    originChainId={originChainId}
                    targetChainId={targetChainId}
                    key={item.key}
                    operationType={operationType}
                    operationDetails={operationDetails}
                    disabled={alreadyApprovalLength >= approvalLength && item.status !== VerifyStatus.Verified}
                    isExpired={isExpired}
                    item={item}
                    isErrorTip={isErrorTip}
                    onError={onError}
                    onSend={(res) => onSend?.(res, index)}
                    onVerifying={(res) => onVerifying?.(res, index)}
                    onAsyncVerifying={(res) => onAsyncVerifying?.(res, index)}
                  />
                ))}
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  }, [
    alreadyApprovalLength,
    approvalLength,
    isErrorTip,
    isExpired,
    loginGuardians,
    onAsyncVerifying,
    onError,
    onSend,
    onVerifying,
    operationDetails,
    operationType,
    originChainId,
    otherGuardians,
    t,
    targetChainId,
  ]);

  const renderExpiredUI = useMemo(() => {
    return (
      <div className="portkey-ui-flex-column-between guardian-expired-content">
        <div className="expire-header">
          <CustomSvg type="Warning" />
          <div className="guardian-list-title">{t('Guardian Approval Expired')}</div>
          <div className="guardian-list-description">
            {t('Your guardian approvals have expired. Please request new approvals to continue or cancel the process.')}
          </div>
        </div>
        <div className="expire-footer portkey-ui-flex-column">
          {onExpiredRetry && <CommonButton type="primary" block onClick={onExpiredRetry}>{`Try Again`}</CommonButton>}
          {onExpiredCancel && <CommonButton type="outline" block onClick={onExpiredCancel}>{`Cancel`}</CommonButton>}
        </div>
      </div>
    );
  }, [onExpiredCancel, onExpiredRetry, t]);

  return (
    <div className={clsx('guardian-list-wrapper', className)}>{isExpired ? renderExpiredUI : renderGuardianList}</div>
  );
}

export default memo(GuardianList);
