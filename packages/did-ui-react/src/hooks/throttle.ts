import { DependencyList, EffectCallback, useCallback, useEffect, useRef } from 'react';

export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const lock = useRef<number>();
  return useCallback((...args: any[]) => {
    if (!callback) return;
    const now = Date.now();
    if (lock.current && lock.current + delay > now) return;
    lock.current = now;
    return callback(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useThrottleEffect(effect: EffectCallback, deps: DependencyList = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(useThrottleCallback(effect, deps), deps);
}
