import clsx from 'clsx';
import { TipContent } from '../Send/components/SendModalTip';
import ButtonGroup from '../ButtonGroup';
import { CommonButtonType } from '../CommonButton';
import './index.less';

export interface SecurityCheckAndAccelerateProps {
  className?: string;
  onConfirm?: (res?: any) => void;
  onClose?: () => void;
}

const PrefixCls = 'portkey-ui-security-check-accelerate';

export default function SecurityCheckAndAccelerateMain({
  className,
  onConfirm,
  onClose,
}: SecurityCheckAndAccelerateProps) {
  return (
    <div className={clsx(`${PrefixCls}-wrapper`, className)}>
      <TipContent
        title={`Wallet security level upgrade in progress`}
        content={`Click “Complete now” to immediately complete the addition of a guardian, or close this window and wait for completion, which will take about 1-3 minutes.`}
        onClose={() => onClose?.()}
      />
      <ButtonGroup
        type="row"
        buttons={[
          {
            type: 'outline' as CommonButtonType,
            onClick: () => onClose?.(),
            content: 'Close',
          },
          {
            type: 'primary' as CommonButtonType,
            onClick: () => onConfirm?.(),
            content: 'Complete now',
          },
        ]}
      />
    </div>
  );
}
