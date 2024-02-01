import type { AccountType } from '@portkey/services';
import clsx from 'clsx';
import BaseVerifierIcon from '../BaseVerifierIcon';
import { guardianIconMap } from '../../constants/guardian';
import GuardianTypeIcon from '../GuardianTypeIcon';
import './index.less';

interface VerifierPairProps {
  guardianType?: AccountType;
  verifierSrc?: string;
  wrapperClassName?: string;
  verifierName?: string;
  size?: number;
}

export default function VerifierPair({
  guardianType = 'Email',
  verifierSrc,
  verifierName,
  wrapperClassName,
}: VerifierPairProps) {
  return (
    <div className={clsx('portkey-ui-flex-row-center icon-pair', wrapperClassName)}>
      <GuardianTypeIcon type={guardianIconMap[guardianType]} />
      <BaseVerifierIcon src={verifierSrc} fallback={verifierName?.[0]} />
    </div>
  );
}
