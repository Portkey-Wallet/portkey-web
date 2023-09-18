import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect, memo } from 'react';
import { getApprovalCount } from '../../utils';
import clsx from 'clsx';
import CommonTooltip from '../CommonTooltip/index.component';
import GuardianItems from './components/GuardianItems';
import { ChainId } from '@portkey/types';
import { UserGuardianStatus, VerifyStatus, OnErrorFunc } from '../../types';
import { OperationTypeEnum } from '@portkey/services';
import './index.less';

export interface GuardianListProps {
  originChainId?: ChainId;
  targetChainId?: ChainId;
  className?: string;
  guardianList?: UserGuardianStatus[];
  expiredTime?: number;
  isErrorTip?: boolean;
  operationType?: OperationTypeEnum;
  onError?: OnErrorFunc;
  onConfirm?: () => void;
  onSend?: (item: UserGuardianStatus, index: number) => void;
  onVerifying?: (item: UserGuardianStatus, index: number) => void;
}

function GuardianList({
  originChainId = 'AELF',
  targetChainId,
  className,
  guardianList = [],
  expiredTime,
  isErrorTip = true,
  operationType = OperationTypeEnum.communityRecovery,
  onError,
  onConfirm,
  onSend,
  onVerifying,
}: GuardianListProps) {
  const { t } = useTranslation();

  const [isExpired, setIsExpired] = useState<boolean>(false);

  const approvalLength = useMemo(() => {
    return getApprovalCount(guardianList.length);
  }, [guardianList.length]);

  const alreadyApprovalLength = useMemo(
    () => guardianList?.filter((item) => item?.status === VerifyStatus.Verified).length,
    [guardianList],
  );

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

  return (
    <div className={clsx('guardian-list-wrapper', className)}>
      <div className="guardian-list-content">
        <div className="guardian-list-title">{t('Guardian Approval')}</div>
        <p className="guardian-list-description">{isExpired ? t('Expired') : t('Expire after 1 hour')}</p>
        <div className="portkey-ui-flex-between-center approve-count">
          <span className="portkey-ui-flex-row-center">
            {t("Guardians' approval")}
            <CommonTooltip
              placement="top"
              title={
                'You will need a certain number of guardians to confirm your action. The requirements differ depending on your guardian counts.'
              }
            />
          </span>
          <div>
            <span className="already-approval">{alreadyApprovalLength}</span>
            <span className="all-approval">{`/${approvalLength}`}</span>
          </div>
        </div>
        <ul className="verifier-content">
          {guardianList?.map((item, index) => (
            <GuardianItems
              originChainId={originChainId}
              targetChainId={targetChainId}
              key={item.key}
              operationType={operationType}
              disabled={alreadyApprovalLength >= approvalLength && item.status !== VerifyStatus.Verified}
              isExpired={isExpired}
              item={item}
              isErrorTip={isErrorTip}
              onError={onError}
              onSend={(res) => onSend?.(res, index)}
              onVerifying={(res) => onVerifying?.(res, index)}
            />
          ))}
          {!isExpired && (
            <div className="btn-wrap">
              <Button
                type="primary"
                className="confirm-approve-btn"
                disabled={alreadyApprovalLength <= 0 || alreadyApprovalLength !== approvalLength}
                onClick={onConfirm}>
                {t('Confirm')}
              </Button>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default memo(GuardianList);
