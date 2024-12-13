import BackHeader from '../BackHeader';
import TitleWrapper, { TitleWrapperProps } from '../TitleWrapper';
import './index.less';

export default function SettingHeader({ title, leftCallBack, rightElement, leftElement, ...props }: TitleWrapperProps) {
  return (
    <BackHeader
      className="setting-header-wrapper"
      title={title}
      leftCallBack={leftCallBack}
      rightElement={rightElement}
      leftElement={leftElement}
      {...props}
    />
  );
}
