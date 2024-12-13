import { useRef, useEffect, useMemo } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import animationDarkData from './spinnerDark';
import animationWhiteData from './spinnerWhite';
import ConfigProvider from '../config-provider';

export type LoadingType = {
  width?: number;
  height?: number;
};

const LoadingIndicator = (props: LoadingType) => {
  const { width = 16, height = 16 } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);
  const theme = useMemo(() => ConfigProvider?.getGlobalConfig()?.theme, []);

  useEffect(() => {
    if (!animation.current) {
      animation.current = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: theme !== 'dark' ? animationWhiteData : animationDarkData,
      });
    }
    return () => {
      animation.current?.stop();
      animation.current?.destroy();
      animation.current = null;
    };
  }, [theme]);

  return <div className="loading" style={{ width, height }} ref={containerRef}></div>;
};

export default LoadingIndicator;
