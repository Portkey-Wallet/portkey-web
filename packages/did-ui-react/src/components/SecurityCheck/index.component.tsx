import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import './index.less';
import ThrottleButton from '../ThrottleButton';

export interface SecurityCheckProps {
  className?: string;
  onCancel?: () => void;
  onConfirm?: (res: any) => void;
}

const PrefixCls = 'portkey-ui-security-check';

export default function SecurityCheckMain({ className, onCancel, onConfirm }: SecurityCheckProps) {
  return (
    <div className={clsx('portkey-ui-text-center', `${PrefixCls}-wrapper`, className)}>
      <div className={`${PrefixCls}-body`}>
        <div className={`${PrefixCls}-banner`}>
          <CustomSvg type="Security" />
        </div>
        <div className={`${PrefixCls}-title`}>Upgrade Wallet Security Level</div>
        <div className={`${PrefixCls}-description`}>
          You have too few guardians to protect your wallet. Please add at least one more guardian before proceeding.
        </div>
      </div>

      <div className={`${PrefixCls}-footer`}>
        <div className="portkey-ui-btn-wrapper">
          <ThrottleButton onClick={onCancel}>Not Now</ThrottleButton>
          <ThrottleButton type="primary" onClick={onConfirm}>
            Add Guardians
          </ThrottleButton>
        </div>
      </div>
    </div>
  );
}
