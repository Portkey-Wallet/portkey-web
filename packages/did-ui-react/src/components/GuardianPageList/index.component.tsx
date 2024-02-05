import { memo, ReactNode } from 'react';
import clsx from 'clsx';
import GuardianItems from './components/GuardianItems';
import { UserGuardianStatus } from '../../types';
import './index.less';

export interface GuardianListProps {
  header?: ReactNode;
  className?: string;
  guardianList?: UserGuardianStatus[];
  tipContainer?: ReactNode;
  onViewGuardian: (item: UserGuardianStatus) => void;
}

function GuardianPageList({ header, className, guardianList = [], tipContainer, onViewGuardian }: GuardianListProps) {
  return (
    <div className={clsx('guardian-list-wrapper guardian-page-list-wrapper portkey-ui-flex-column', className)}>
      {header}
      <div className="portkey-ui-flex-column portkey-ui-flex-between guardian-list-container">
        <ul className="guardian-list">
          {guardianList.map((item) => (
            <GuardianItems key={item.key} item={item} onClick={onViewGuardian} />
          ))}
        </ul>
        {tipContainer}
      </div>
    </div>
  );
}

export default memo(GuardianPageList);
