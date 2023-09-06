import { Button } from 'antd';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import './index.less';

export interface SecurityCheckProps {
  onCancel?: () => void;
  onConfirm?: (res: any) => void;
}

const PrefixCls = 'portkey-ui-security-check';

export default function SecurityCheckMain({ onCancel, onConfirm }: SecurityCheckProps) {
  return (
    <div className={clsx('portkey-ui-text-center', `${PrefixCls}-wrapper`)}>
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
        <div className="btn-wrapper">
          <Button onClick={onCancel}>Not Now</Button>
          <Button type="primary" onClick={onConfirm}>
            Add Guardians
          </Button>
        </div>
      </div>
    </div>
  );
}
