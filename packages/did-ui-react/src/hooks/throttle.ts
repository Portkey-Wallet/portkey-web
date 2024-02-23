import { DependencyList, EffectCallback, useCallback, useEffect, useRef } from 'react';
import { useLatestRef } from './debounce';

/**
 * Within a certain period of time, execute the first triggered function
 */
export function useThrottleFirstCallback<T extends (...args: any[]) => any>(
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

/**
 * Within a certain period of time, execute the last triggered function
 */
export function useThrottleLatestCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  delay = 500,
) {
  const timerRef = useRef<NodeJS.Timeout | number>();
  const callbackRef = useLatestRef(callback);

  return useCallback((...args: any[]) => {
    if (!callbackRef.current) return;

    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;

        callbackRef.current(...args);
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useThrottleFirstEffect(effect: EffectCallback, deps: DependencyList = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(useThrottleFirstCallback(effect, deps), deps);
}

export function useThrottleLatestEffect(effect: EffectCallback, deps: DependencyList = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(useThrottleLatestCallback(effect, deps), deps);
}
