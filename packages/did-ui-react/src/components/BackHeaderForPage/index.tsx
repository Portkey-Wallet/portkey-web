import BackHeader from '../BackHeader';
import TitleWrapper, { TitleWrapperProps } from '../TitleWrapper';
import './index.less';

export default function BackHeaderForPage({ title, leftCallBack, rightElement, ...props }: TitleWrapperProps) {
  return (
    <BackHeader
      className="back-header-page-wrapper"
      title={title}
      leftElement={undefined}
      leftCallBack={leftCallBack}
      rightElement={rightElement}
      {...props}
    />
  );
}
