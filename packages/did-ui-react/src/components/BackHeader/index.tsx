import TitleWrapper, { TitleWrapperProps } from '../TitleWrapper';
import { useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export default function BackHeader({
  title,
  onBack,
  rightElement,
  ...props
}: TitleWrapperProps & { onBack?: TitleWrapperProps['leftCallBack'] }) {
  const defaultLeftEle = useMemo(
    () => (
      <div className="flex-row-center default-left-ele">
        <CustomSvg type="BackLeft" className="left-arrow" />
        <span>Back</span>
      </div>
    ),
    [],
  );

  return (
    <TitleWrapper
      className="back-header"
      title={title}
      leftCallBack={onBack}
      rightElement={rightElement}
      leftElement={defaultLeftEle}
      {...props}
    />
  );
}
