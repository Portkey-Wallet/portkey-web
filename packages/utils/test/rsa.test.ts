import { describe, expect, test } from 'vitest';
import { ForgeCryptoManager } from '../src/crypto/forge';

describe('RSA Tests (Using Forge Alternative)', () => {
  test('test generateKeyPair', async () => {
    const forgeManager = new ForgeCryptoManager();
    const result = await forgeManager.generateKeyPair();
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('privateKey');
    expect(result.publicKey).toContain('-----BEGIN RSA PUBLIC KEY-----');
    expect(result.privateKey).toContain('-----BEGIN RSA PRIVATE KEY-----');
  });

  test('test rsaEncrypt', async () => {
    const forgeManager = new ForgeCryptoManager();
    const keyPair = await forgeManager.generateKeyPair();
    const m = 'portkey';

    const encodedStr = await forgeManager.encrypt(keyPair.publicKey, m);
    expect(encodedStr).not.toBeUndefined();
    expect(encodedStr.length).toBeGreaterThan(0);
  });

  test('test rsaDecrypt', async () => {
    const forgeManager = new ForgeCryptoManager();
    const keyPair = await forgeManager.generateKeyPair();
    const m = 'portkey';
    const encodedStr = await forgeManager.encrypt(keyPair.publicKey, m);
    const decodeStr = await forgeManager.decrypt(keyPair.privateKey, encodedStr);
    expect(decodeStr).toEqual(m);
  });

  test('test long message encryption/decryption', async () => {
    const forgeManager = new ForgeCryptoManager();
    const keyPair = await forgeManager.generateKeyPair();
    const longMessage =
      'This is a very long message that needs to be encrypted and decrypted properly. It contains multiple sentences and should work correctly with the RSA encryption system.';

    const encodedStr = await forgeManager.encryptLong(keyPair.publicKey, longMessage);
    expect(encodedStr).not.toBeUndefined();
    expect(encodedStr).toContain(';'); // Long encryption uses semicolon separator

    const decodeStr = await forgeManager.decryptLong(keyPair.privateKey, encodedStr);
    expect(decodeStr).toEqual(longMessage);
  });
});
