import { useMemo } from 'react';
import './index.less';

export enum LoadingColor {
  WHITE = 'white',
  DARK = 'dark',
}

export type LoadingType = {
  width?: number;
  height?: number;
  color?: LoadingColor;
};

const PureLoadingIndicator = (props: LoadingType) => {
  const { width = 16, height = 16, color = false } = props;

  const loadingClass = useMemo(() => {
    if (color === LoadingColor.WHITE) return 'loading-spinner-white';
    if (color === LoadingColor.DARK) return 'loading-spinner-dark';
    return 'loading-spinner-dark';
  }, [color]);

  return <div className={loadingClass + ' loading'} style={{ width, height }}></div>;
};

export default PureLoadingIndicator;
