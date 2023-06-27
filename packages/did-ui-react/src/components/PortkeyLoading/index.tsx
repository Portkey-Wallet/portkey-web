import clsx from 'clsx';
import { OpacityType } from '../../types';
import { useMemo } from 'react';
import Loading from '../Loading';
import './index.less';
import CustomSvg from '../CustomSvg';

export interface PortkeyLoadingProps {
  loading?: boolean | OpacityType;
  loadingText?: string;
  cancelable?: boolean;
  className?: string;
  onCancel?: () => void;
}

export default function PortkeyLoading({
  loading,
  loadingText = 'Loading...',
  cancelable,
  className,
  onCancel,
}: PortkeyLoadingProps) {
  const style = useMemo(
    () =>
      typeof loading !== 'number'
        ? undefined
        : {
            backgroundColor: `rgb(00 00 00 / ${loading * 100}%)`,
          },
    [loading],
  );

  return loading ? (
    <div className={clsx('portkey-ui-fix-max-content portkey-ui-loading-wrapper', className)} style={style}>
      {cancelable && <CustomSvg className="close-icon" type="Close" onClick={onCancel} />}
      <div className="loading-indicator portkey-ui-flex-column-center">
        <Loading />
        <div className="loading-text">{loadingText}</div>
      </div>
    </div>
  ) : null;
}
