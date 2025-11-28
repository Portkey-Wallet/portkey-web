import { sleep } from './misc';

export type RetryOptions = {
  interval: number;
  reCount: number;
  maxCount: number;
};

const DefaultQueryOptions: RetryOptions = {
  interval: 1000,
  reCount: 0,
  maxCount: 5,
};

export const retryAsyncFunction = async <T>(
  fetch: () => Promise<T>,
  options: RetryOptions = JSON.parse(JSON.stringify(DefaultQueryOptions)),
  checkIsInvalidError?: (error: any) => boolean,
): Promise<T> => {
  try {
    return await fetch();
  } catch (error) {
    if (checkIsInvalidError?.(error)) throw error;
    if (options.reCount >= options.maxCount) throw error;
    await sleep(options.interval);
    return retryAsyncFunction(fetch, { ...options, reCount: ++options.reCount });
  }
};
