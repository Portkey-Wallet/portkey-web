import clsx from 'clsx';
import Src from '../../assets/images/upgraded.png';
import CustomSvg from '../CustomSvg';
import './index.less';

export default function SwitchUpgradedPortkey({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={clsx('portkey-ui-switch-upgraded-wrapper', className)}>
      <div className="portkey-ui-flex-between-center portkey-ui-switch-upgraded-inner">
        <div className="portkey-ui-flex-between-center">
          <img src={Src} />
          <div className="text">Use the Upgraded Portkey</div>
        </div>

        <CustomSvg type="Arrow" onClick={onClick} />
      </div>
    </div>
  );
}
