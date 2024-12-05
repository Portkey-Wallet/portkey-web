import { describe, expect, test } from 'vitest';
import { generateKeyPairSync, rsaDecrypt, rsaEncrypt } from '../src/rsa';
//   const keyPair = generateKeyPairSync();
//   console.log(keyPair, '====keyPair');
//   const m = 'portkey';
//   const str = rsaEncrypt(m, keyPair.publicKey);
//   const m2 = rsaDecrypt(str, keyPair.privateKey);
//   console.log(m2, '====m2');

describe('aes describe', () => {
  test('test generateKeyPairSync', () => {
    const result = generateKeyPairSync();
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('privateKey');
  });

  test('test rsaEncrypt', () => {
    const keyPair = generateKeyPairSync();

    const m = 'portkey';

    const encodedStr = rsaEncrypt(m, keyPair.publicKey);
    expect(encodedStr).not.toBeUndefined();
  });

  test('test rsaDecrypt', () => {
    const keyPair = generateKeyPairSync();
    const m = 'portkey';
    const encodedStr = rsaEncrypt(m, keyPair.publicKey);
    const decodeStr = rsaDecrypt(encodedStr, keyPair.privateKey);
    expect(decodeStr).toEqual(m);
  });
});
