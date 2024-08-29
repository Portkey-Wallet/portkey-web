import type { AccountType } from '@portkey/services';
import clsx from 'clsx';
import BaseVerifierIcon from '../BaseVerifierIcon';
import { guardianIconMap, zkGuardianType, zkLoginVerifierItem } from '../../constants/guardian';
import GuardianTypeIcon from '../GuardianTypeIcon';
import './index.less';
import { UserGuardianStatus } from '../../types';
import { useMemo } from 'react';

interface VerifierPairProps {
  guardianType?: AccountType;
  verifierSrc?: string;
  wrapperClassName?: string;
  verifierName?: string;
  size?: number;
  guardian?: UserGuardianStatus;
}

export default function VerifierPair({
  guardianType = 'Email',
  verifierSrc,
  verifierName,
  wrapperClassName,
  guardian,
}: VerifierPairProps) {
  const isZK = useMemo(
    () => guardian?.verifiedByZk || guardian?.manuallySupportForZk,
    [guardian?.manuallySupportForZk, guardian?.verifiedByZk],
  );
  const isShowZkLoginTag = useMemo(() => !isZK && zkGuardianType.includes(guardianType), [guardianType, isZK]);
  return (
    <div className={clsx('portkey-ui-flex-row-center icon-pair xxx', wrapperClassName)}>
      <GuardianTypeIcon type={guardianIconMap[guardianType]} />
      <BaseVerifierIcon
        src={isZK ? zkLoginVerifierItem.imageUrl : verifierSrc}
        fallback={isZK ? zkLoginVerifierItem.name[0] : verifierName?.[0]}
      />
      {isShowZkLoginTag && <div className="zklogin-icon">{`zkLogin`}</div>}
    </div>
  );
}
