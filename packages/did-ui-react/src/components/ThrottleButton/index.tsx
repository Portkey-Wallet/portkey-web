import { Button, ButtonProps } from 'antd';
import { useEffect, useRef } from 'react';
import { useThrottleFirstCallback } from '../../hooks/throttle';

export default function ThrottleButton({ onClick, ...props }: ButtonProps) {
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });
  const throttleClick = useThrottleFirstCallback(
    (e) => {
      onClickRef.current?.(e);
    },
    [],
    500,
  );
  return <Button {...props} onClick={throttleClick} />;
}
