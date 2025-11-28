import { useMemo } from 'react';
import ConfigProvider from '../config-provider';
import './index.less';

export enum LoadingColor {
  WHITE = 'white',
  DARK = 'dark',
}

export type LoadingType = {
  width?: number;
  height?: number;
  color?: LoadingColor;
  isDarkThemeWhiteLoading?: boolean;
};

const LoadingIndicator = (props: LoadingType) => {
  const { width = 16, height = 16, color, isDarkThemeWhiteLoading = false } = props;
  const theme = useMemo(() => ConfigProvider?.getGlobalConfig()?.theme, []);

  const loadingClass = useMemo(() => {
    if (color === LoadingColor.WHITE) return 'loading-spinner-white';
    if (color === LoadingColor.DARK) return 'loading-spinner-dark';
    if (isDarkThemeWhiteLoading) {
      return theme !== 'dark' ? 'loading-spinner-dark' : 'loading-spinner-white';
    }
    return theme !== 'dark' ? 'loading-spinner-dark' : 'loading-spinner-white';
  }, [color, isDarkThemeWhiteLoading, theme]);

  return <div className={loadingClass + ' loading'} style={{ width, height }}></div>;
};

export default LoadingIndicator;
