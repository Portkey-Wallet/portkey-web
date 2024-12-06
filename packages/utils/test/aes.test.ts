import { describe, expect, test } from 'vitest';
import { encrypt, decrypt } from '../src/aes';

describe('aes describe', () => {
  test('test encrypt', () => {
    const result = encrypt('123', '123');
    expect(result).not.toBeUndefined();
  });

  test('test decrypt', () => {
    const encodedStr = encrypt('123', '456');
    const result = decrypt(encodedStr, '456');
    expect(result).toEqual('123');

    const resultError = decrypt({} as any, undefined as any);
    expect(resultError).toEqual(false);
  });
});
