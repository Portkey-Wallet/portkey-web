import { useEffect, useRef } from 'react';
import { useThrottleFirstCallback } from '../../hooks/throttle';
import CommonButton, { CommonButtonProps } from '../CommonButton';

export default function ThrottleButton({ onClick, ...props }: CommonButtonProps) {
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
  return <CommonButton {...props} onClick={throttleClick} />;
}
