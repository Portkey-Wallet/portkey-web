import { Button } from 'antd';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import './index.less';

export interface SecurityCheckAndAccelerateProps {
  className?: string;
  onConfirm?: (res: any) => void;
  onClose?: () => void;
}

const PrefixCls = 'portkey-ui-security-check-accelerate';

export default function SecurityCheckAndAccelerateMain({
  className,
  onConfirm,
  onClose,
}: SecurityCheckAndAccelerateProps) {
  return (
    <div className={clsx('portkey-ui-text-center', `${PrefixCls}-wrapper`, className)}>
      {onClose && <CustomSvg type="Close2" onClick={onClose} />}
      <div className={`${PrefixCls}-body`}>
        <div className={`${PrefixCls}-banner`}>
          <CustomSvg type="Security" />
        </div>
        <div className={`${PrefixCls}-title`}>Wallet Security Level Upgrade in Progress</div>
        <div className={`${PrefixCls}-description`}>
          {`You can click "OK" to complete the addition of guardian immediately. Alternatively, you have the option to close this window and wait for the completion, which will take around 1-3 minutes.`}
        </div>
      </div>

      <div className={`${PrefixCls}-footer`}>
        <div className="portkey-ui-btn-wrapper">
          <Button type="primary" onClick={onConfirm}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
