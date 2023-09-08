import { memo, ReactNode } from 'react';
import clsx from 'clsx';
import GuardianItems from './components/GuardianItems';
import { ChainId } from '@portkey/types';
import { UserGuardianStatus } from '../../types';
import { OperationTypeEnum } from '@portkey/services';
import './index.less';

export interface GuardianListProps {
  header?: ReactNode;
  chainId?: ChainId;
  className?: string;
  guardianList?: UserGuardianStatus[];
  operationType?: OperationTypeEnum;
  onAddGuardian: () => void;
  onViewGuardian: (item: UserGuardianStatus) => void;
}

function GuardianPageList({
  header,
  chainId = 'AELF',
  className,
  guardianList = [],
  onViewGuardian,
}: GuardianListProps) {
  return (
    <div className={clsx('guardian-list-wrapper guardian-page-list-wrapper', className)}>
      {header}
      <ul className="guardian-list-container">
        {guardianList.map((item) => (
          <GuardianItems chainId={chainId} key={item.key} item={item} onClick={onViewGuardian} />
        ))}
      </ul>
    </div>
  );
}

export default memo(GuardianPageList);
