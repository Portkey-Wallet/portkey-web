import CustomSvg, { CustomSvgType } from '../CustomSvg';
import clsx from 'clsx';
import './index.less';

interface GuardianTypeIconProps {
  type: CustomSvgType;
  className?: string;
}

export default function GuardianTypeIcon({ type, className }: GuardianTypeIconProps) {
  const cls = type === 'Email' ? 'guardian-type-email-icon' : '';
  return (
    <div className={clsx('base-guardian-type-icon', 'portkey-ui-flex-center', cls, className)}>
      <CustomSvg className="portkey-ui-flex-center guardian-type-icon" type={type} />
    </div>
  );
}
