import { useRef, useEffect } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import animationData from './spinnerDark';

export type LoadingType = {
  width?: number;
  height?: number;
};

const LoadingIndicator = (props: LoadingType) => {
  const { width = 16, height = 16 } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!animation.current) {
      animation.current = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });
    }
    return () => {
      animation.current?.stop();
      animation.current?.destroy();
      animation.current = null;
    };
  }, []);

  return <div className="loading" style={{ width, height }} ref={containerRef}></div>;
};

export default LoadingIndicator;
