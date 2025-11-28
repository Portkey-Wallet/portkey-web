import { memo, ReactNode } from 'react';
import clsx from 'clsx';
import GuardianItems from './components/GuardianItems';
import { UserGuardianStatus } from '../../types';
import './index.less';
import { Loading } from '..';

export interface GuardianListProps {
  header?: ReactNode;
  className?: string;
  guardianList?: UserGuardianStatus[];
  tipContainer?: ReactNode;
  onViewGuardian: (item: UserGuardianStatus) => void;
  isLoading?: boolean;
}

function GuardianPageList({
  header,
  className,
  guardianList = [],
  isLoading,
  tipContainer,
  onViewGuardian,
}: GuardianListProps) {
  const loginAccount = guardianList.filter((item) => item.isLoginGuardian);
  const otherGuardian = guardianList.filter((item) => !item.isLoginGuardian);

  console.log('guardianList', guardianList);
  return (
    <div className={clsx('guardian-list-wrapper guardian-page-list-wrapper portkey-ui-flex-column', className)}>
      {header}
      <div className="portkey-ui-flex-column portkey-ui-flex-between guardian-list-container">
        {isLoading ? (
          <div className="loading">
            <Loading width={24} height={24} />
          </div>
        ) : (
          <ul className="guardian-list">
            {loginAccount.map((item) => (
              <div key={item.key}>
                <div className="login-icon">{`Login Account(s)`}</div>
                <GuardianItems item={item} onClick={onViewGuardian} />
              </div>
            ))}
            {otherGuardian.length > 0 && <div className="login-icon">{`Other guardian(s)`}</div>}
            {otherGuardian.map((item) => (
              <div key={item.key}>
                <GuardianItems item={item} onClick={onViewGuardian} />
              </div>
            ))}
            <div className="link">
              <a
                href="https://doc.portkey.finance/docs/What-are-guardians-and-verifiers"
                target="_blank"
                rel="noreferrer">{`Learn more about account guardians`}</a>
            </div>
          </ul>
        )}

        {tipContainer}
      </div>
    </div>
  );
}

export default memo(GuardianPageList);
