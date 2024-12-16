import TitleWrapper, { TitleWrapperProps } from '../TitleWrapper';
import { useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export default function BackHeader({
  title,
  onBack,
  rightElement,
  leftElement,
  className,
  ...props
}: TitleWrapperProps & { onBack?: TitleWrapperProps['leftCallBack'] }) {
  const defaultLeftEle = useMemo(
    () => (
      <div className="portkey-ui-flex-row-center default-left-ele">
        <CustomSvg type="ArrowLeft" className="left-arrow" />
      </div>
    ),
    [],
  );

  return (
    <TitleWrapper
      className={`back-header ${className}`}
      title={title}
      leftCallBack={onBack}
      rightElement={rightElement}
      leftElement={typeof leftElement === 'undefined' ? defaultLeftEle : leftElement}
      {...props}
    />
  );
}
