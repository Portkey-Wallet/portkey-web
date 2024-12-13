import React, { useState, useRef, useEffect, useCallback } from 'react';
import './index.less';

interface ExpandableTextProps {
  description: string;
  textClassName: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ description, textClassName }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const compute = useCallback(() => {
    if (textRef.current) {
      const height = textRef.current.scrollHeight;
      if (height > 48) {
        // Assuming 24px per line, adjust as needed
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    }
  }, []);
  useEffect(() => {
    // listener window resize, can change smoothly
    window.addEventListener('resize', compute);
    compute();

    return () => {
      window.removeEventListener('resize', compute);
    };
  }, [compute]);
  return (
    <div className="expandable-text">
      <div ref={textRef} className={`description ${collapsed ? 'collapsed' : ''} ${textClassName}`}>
        {description}
      </div>
      {showButton && (
        <div className="toggle-button" onClick={() => setCollapsed((prev) => !prev)}>
          {collapsed ? 'Show more' : 'Show less'}
        </div>
      )}
    </div>
  );
};

export default ExpandableText;
