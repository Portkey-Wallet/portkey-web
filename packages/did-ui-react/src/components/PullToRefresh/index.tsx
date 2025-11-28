import React, { useState, useRef, TouchEvent, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startY = useRef<number | null>(null);
  const threshold = 60;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (startY.current !== null) {
      const touchY = e.touches[0].pageY;
      const distance = touchY - startY.current;

      if (distance > threshold && !isRefreshing && containerRef.current?.scrollTop === 0) {
        setIsRefreshing(true);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          startY.current = null;
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        overflowY: 'auto',
        maxHeight: '400px', // Adjust this according to your layout needs
        border: '1px solid #ccc',
        borderRadius: '5px',
      }}>
      {isRefreshing && <div style={{ padding: '10px', textAlign: 'center' }}>Refreshing...</div>}
      {children}
    </div>
  );
};

export default PullToRefresh;
