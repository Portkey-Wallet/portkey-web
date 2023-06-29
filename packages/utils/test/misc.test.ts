import { describe, expect, test } from '@jest/globals';
import { randomId, sleep } from '../src/misc';

describe('misc describe', () => {
  test('test sleep', async () => {
    const result = await sleep(100);
    expect(result).toBeUndefined();
  });
  test('test randomId', () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1 === id2).toBe(false);
  });
});
