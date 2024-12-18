import CommonButton, { CommonButtonType } from '../CommonButton';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface ICompletedProps {
  title?: string;
  description: string;
  iconTitle?: string;
  buttonType?: CommonButtonType;
  onClose: () => void;
}

export default function Completed({
  title = 'Submitted',
  description = '',
  iconTitle = 'Close',
  buttonType = 'primary',
  onClose,
}: ICompletedProps) {
  return (
    <div className="completed-wrapper flex-column">
      <div className="completed-content flex-1 flex-column-center">
        <CustomSvg type="Activity-status-success" />
        <div className="content-main">{title}</div>
        <div className="content-desc">{description}</div>
      </div>
      <div className="completed-button flex">
        <CommonButton type={buttonType} onClick={onClose} block>
          {iconTitle}
        </CommonButton>
      </div>
    </div>
  );
}
