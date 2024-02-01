import type { AccountType } from '@portkey/services';
import clsx from 'clsx';
import BaseVerifierIcon from '../BaseVerifierIcon';
import CustomSvg from '../CustomSvg';
import { guardianIconMap } from '../../constants/guardian';
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
  size = 32,
  verifierSrc,
  verifierName,
  wrapperClassName,
}: VerifierPairProps) {
  return (
    <div className={clsx('portkey-ui-flex-row-center icon-pair', wrapperClassName)}>
      <CustomSvg type={guardianIconMap[guardianType]} style={{ width: size, height: size }} />
      <BaseVerifierIcon src={verifierSrc} fallback={verifierName?.[0]} />
    </div>
  );
}
