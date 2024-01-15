import type { AccountType } from '@portkey-v1/services';
import clsx from 'clsx';
import BaseVerifierIcon from '../BaseVerifierIcon';
import CustomSvg from '../CustomSvg';
import './index.less';

interface VerifierPairProps {
  guardianType?: AccountType;
  verifierSrc?: string;
  wrapperClassName?: string;
  verifierName?: string;
  size?: number;
}

const GuardianTypeIcon: Record<AccountType, any> = {
  Email: 'Email',
  Phone: 'GuardianPhone',
  Google: 'GuardianGoogle',
  Apple: 'GuardianApple',
  Telegram: 'GuardianTelegram',
};

export default function VerifierPair({
  guardianType = 'Email',
  size = 32,
  verifierSrc,
  verifierName,
  wrapperClassName,
}: VerifierPairProps) {
  return (
    <div className={clsx('portkey-ui-flex-row-center icon-pair', wrapperClassName)}>
      <CustomSvg type={GuardianTypeIcon[guardianType]} style={{ width: size, height: size }} />
      <BaseVerifierIcon src={verifierSrc} fallback={verifierName?.[0]} />
    </div>
  );
}
