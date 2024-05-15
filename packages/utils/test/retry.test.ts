import { describe, expect, test } from '@jest/globals';
import { RetryOptions, retryAsyncFunction } from '../src/retry';
import { sleep } from '../src/misc';
const DefaultQueryOptions: RetryOptions = {
  interval: 10,
  reCount: 1,
  maxCount: 5,
};

describe('retry describe', () => {
  test('test reCount 1', async () => {
    let reCount = 0;
    const info = await retryAsyncFunction(async () => {
      ++reCount;
      await sleep(10);
      if (reCount < 1) {
        throw new Error('error');
      }
      return true;
    });
    expect(reCount).toEqual(1);
    expect(info).toEqual(true);
  });
  test('test reCount 3', async () => {
    const errMsg = 'error';
    let reCount = 0;
    const info = await retryAsyncFunction(
      async () => {
        ++reCount;
        await sleep(10);
        if (reCount < 3) {
          throw new Error(errMsg);
        }
        return true;
      },
      JSON.parse(JSON.stringify(DefaultQueryOptions)),
      error => !(error?.message as string)?.includes(errMsg),
    );
    expect(reCount).toEqual(3);
    expect(info).toEqual(true);
  });

  test('test reCount 1', async () => {
    const errMsg = 'error';
    let reCount = 0;
    try {
      const info = await retryAsyncFunction(
        async () => {
          ++reCount;
          await sleep(10);
          if (reCount < 3) {
            throw new Error(errMsg);
          }
          return true;
        },
        JSON.parse(JSON.stringify(DefaultQueryOptions)),
        error => (error?.message as string)?.includes(errMsg),
      );
      expect(info).toEqual(true);
    } catch (error) {
      expect(error.message).toEqual(errMsg);
    }
    expect(reCount).toEqual(1);
  });

  test('test reCount 5', async () => {
    const errMsg = 'error';
    let reCount = 0;
    try {
      await retryAsyncFunction(async () => {
        ++reCount;
        await sleep(10);
        if (reCount < 10) {
          throw new Error(errMsg);
        }
        return true;
      }, JSON.parse(JSON.stringify(DefaultQueryOptions)));
    } catch (error) {
      expect(error.message).toEqual(errMsg);
    }
    expect(reCount).toEqual(5);
  });
});
