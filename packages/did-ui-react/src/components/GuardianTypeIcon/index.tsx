import CustomSvg, { CustomSvgType } from '../CustomSvg';
import clsx from 'clsx';
import './index.less';

interface GuardianTypeIconProps {
  type: CustomSvgType;
  className?: string;
}

export default function GuardianTypeIcon({ type, className }: GuardianTypeIconProps) {
  return (
    <div className={clsx('base-guardian-type-icon', 'portkey-ui-flex-center', className)}>
      <CustomSvg className="portkey-ui-flex-center guardian-type-icon" type={type} />
    </div>
  );
}
