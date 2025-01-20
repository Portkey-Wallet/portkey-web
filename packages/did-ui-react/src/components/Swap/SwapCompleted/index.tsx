import './index.less';
import CustomSvg from '../../CustomSvg';
import ThrottleButton from '../../ThrottleButton';
import { usePortkey } from '../../context';

export type TSwapCompletedProps = {
  onClose?: () => void;
};
export const SwapCompleted = ({ onClose }: TSwapCompletedProps) => {
  const [{ theme }] = usePortkey();

  return (
    <div className="swap-completed">
      <div className="swap-completed-body swap-common-padding">
        <CustomSvg
          className="swap-completed-icon"
          type={theme === 'dark' ? 'Activity-status-success' : 'Activity-status-success-white'}
        />
        <div className="swap-completed-title">Transaction completed</div>
        <div className="swap-completed-sub-title">{'View the transaction in “Activity” tab to check its status.'}</div>
      </div>

      <div className="swap-completed-footer swap-common-padding">
        <ThrottleButton type="primary" onClick={onClose}>
          Close
        </ThrottleButton>
      </div>
    </div>
  );
};
