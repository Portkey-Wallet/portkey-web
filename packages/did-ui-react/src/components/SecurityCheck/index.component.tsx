import clsx from 'clsx';
import { TipContent } from '../Send/components/SendModalTip';
import ButtonGroup from '../ButtonGroup';
import { CommonButtonType } from '../CommonButton';
import './index.less';

export interface SecurityCheckProps {
  className?: string;
  onCancel?: () => void;
  onConfirm?: (res?: any) => void;
}

const PrefixCls = 'portkey-ui-security-check';

export default function SecurityCheckMain({ className, onCancel, onConfirm }: SecurityCheckProps) {
  return (
    <div className={clsx(`${PrefixCls}-wrapper`, className)}>
      <TipContent
        title={`Upgrade wallet security level`}
        content={`You have too few guardians to protect your wallet. Please add at least one more guardian before proceeding.`}
        onClose={() => onCancel?.()}
      />
      <ButtonGroup
        type="row"
        buttons={[
          {
            type: 'outline' as CommonButtonType,
            onClick: () => onCancel?.(),
            content: 'Not now',
          },
          {
            type: 'primary' as CommonButtonType,
            onClick: () => onConfirm?.(),
            content: 'Add guardians',
          },
        ]}
      />
    </div>
  );
}
