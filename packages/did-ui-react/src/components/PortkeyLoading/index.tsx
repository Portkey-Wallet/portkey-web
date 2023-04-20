import clsx from 'clsx';
import { OpacityType } from '../../types';
import { useMemo } from 'react';
import Loading from '../Loading';
import './index.less';

export interface PortkeyLoadingProps {
  loading?: boolean | OpacityType;
  loadingText?: string;
  className?: string;
}

export default function PortkeyLoading({ loading, loadingText = 'Loading...', className }: PortkeyLoadingProps) {
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
    <div className={clsx('fix-max-content portkey-ui-loading-wrapper', className)} style={style}>
      <Loading />
      <div className="loading-text">{loadingText}</div>
    </div>
  ) : null;
}
