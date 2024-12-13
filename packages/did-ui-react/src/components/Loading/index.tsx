import { useRef, useEffect, useMemo } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import animationDarkData from './spinnerDark';
import animationWhiteData from './spinnerWhite';
import ConfigProvider from '../config-provider';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);
  const theme = useMemo(() => ConfigProvider?.getGlobalConfig()?.theme, []);
  const animationData = useMemo(() => {
    if (color === LoadingColor.WHITE) return animationWhiteData;
    if (color === LoadingColor.DARK) return animationDarkData;
    if (isDarkThemeWhiteLoading) {
      return theme === 'dark' ? animationWhiteData : animationDarkData;
    }
    return theme !== 'dark' ? animationWhiteData : animationDarkData;
  }, [color, isDarkThemeWhiteLoading, theme]);

  useEffect(() => {
    if (!animation.current) {
      animation.current = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
      });
    }
    return () => {
      animation.current?.stop();
      animation.current?.destroy();
      animation.current = null;
    };
  }, [animationData, theme]);

  return <div className="loading" style={{ width, height }} ref={containerRef}></div>;
};

export default LoadingIndicator;
