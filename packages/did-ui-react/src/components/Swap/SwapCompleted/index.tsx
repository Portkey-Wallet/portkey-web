import './index.less';
import { Button } from 'antd';

import { useCallback } from 'react';
import CustomSvg from '../../CustomSvg';

export const SwapCompleted = () => {
  const onClose = useCallback(() => {
    // TODO: swap back
    // navigate(-1);
  }, []);

  return (
    <div className="swap-completed">
      <div className="swap-completed-body swap-common-padding">
        {/* TODO: swap svg origin: activity-success */}
        <CustomSvg className="swap-completed-icon" type="Activity-status-success" />
        <div className="swap-completed-title">Transaction completed</div>
        <div className="swap-completed-sub-title">{'View the transaction in “Activity” tab to check its status.'}</div>
      </div>

      <div className="swap-completed-footer swap-common-padding">
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
