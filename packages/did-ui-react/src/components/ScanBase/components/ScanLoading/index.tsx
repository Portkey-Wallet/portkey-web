import { useRef } from 'react';
import './index.less';

export default function ScanLoading() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="scan-loading-inner" ref={containerRef}>
      <div className="scan-loading-spinner"></div>
    </div>
  );
}
