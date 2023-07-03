import lottie, { AnimationItem } from 'lottie-web';
import { useRef, useEffect } from 'react';
import ScanLoadingAnimation from './ScanLoading';
import './index.less';

export default function ScanLoading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!animation.current) {
      animation.current = lottie.loadAnimation({
        container: containerRef.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: ScanLoadingAnimation,
      });
    }
    return () => {
      animation.current?.stop();
      animation.current?.destroy();
      animation.current = null;
    };
  }, []);
  return <div className="scan-loading-inner" ref={containerRef}></div>;
}
