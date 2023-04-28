import { describe, expect, test } from '@jest/globals';
import { sleep } from '../src/misc';

describe('misc describe', () => {
  test('test sleep', async () => {
    const result = await sleep(100);
    expect(result).toBeUndefined();
  });
});
