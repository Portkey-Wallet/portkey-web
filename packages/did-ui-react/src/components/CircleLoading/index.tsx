import { useRef, useEffect } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import animationData from './loading';
import clsx from 'clsx';

const CircleLoading = ({ loading, className }: { loading?: boolean; className?: string }) => {
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
      if (animation.current) {
        animation.current.stop();
        animation.current.destroy();
        animation.current = null;
      }
    };
  }, []);

  return (
    <div
      className={clsx('circle-loading', className)}
      style={{ display: loading ? 'block' : 'none' }}
      ref={containerRef}></div>
  );
};

export default CircleLoading;
