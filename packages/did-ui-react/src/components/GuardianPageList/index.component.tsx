import { memo, ReactNode } from 'react';
import clsx from 'clsx';
import GuardianItems from './components/GuardianItems';
import { UserGuardianStatus } from '../../types';
import './index.less';

export interface GuardianListProps {
  header?: ReactNode;
  className?: string;
  guardianList?: UserGuardianStatus[];
  onViewGuardian: (item: UserGuardianStatus) => void;
}

function GuardianPageList({ header, className, guardianList = [], onViewGuardian }: GuardianListProps) {
  return (
    <div className={clsx('guardian-list-wrapper guardian-page-list-wrapper', className)}>
      {header}
      <ul className="guardian-list-container">
        {guardianList.map((item) => (
          <GuardianItems key={item.key} item={item} onClick={onViewGuardian} />
        ))}
      </ul>
    </div>
  );
}

export default memo(GuardianPageList);
