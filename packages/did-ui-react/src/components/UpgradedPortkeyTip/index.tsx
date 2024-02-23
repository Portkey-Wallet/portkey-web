import clsx from 'clsx';
import './index.less';

export default function UpgradedPortkeyTip({ className }: { className?: string }) {
  return <div className={clsx('portkey-ui-upgraded-tip', className)}>Upgraded Portkey</div>;
}
