import BackHeader from '../../../BackHeader';
import SetPinBase, { SetPinBaseProps } from '../../../SetPinBase/index.component';
import './index.less';

interface SetPinProps extends SetPinBaseProps {
  onCancel?: () => void;
}

export default function SetPin(props: SetPinProps) {
  return (
    <div className="scan-set-pin-wrapper">
      <BackHeader onBack={props?.onCancel} />
      <SetPinBase {...props} />
    </div>
  );
}
