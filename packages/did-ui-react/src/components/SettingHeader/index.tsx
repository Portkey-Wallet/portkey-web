import TitleWrapper, { TitleWrapperProps } from '../TitleWrapper';
import './index.less';

export default function SettingHeader({ title, leftCallBack, rightElement }: TitleWrapperProps) {
  return (
    <TitleWrapper
      className="setting-header-wrapper"
      title={title}
      leftCallBack={leftCallBack}
      rightElement={rightElement}
    />
  );
}
