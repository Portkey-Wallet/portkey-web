import { test } from '@jest/globals';
import { expect } from '@jest/globals';
import { describe } from 'node:test';
import { webcrypto } from 'crypto';
import { WebCryptoManager } from '../src/crypto';

describe('WebCryptoManager', () => {
  // @ts-ignore
  const cryptoManager = new WebCryptoManager(webcrypto.subtle);
  test('should get keypair', async () => {
    const keyPair = await cryptoManager.generateKeyPair();
    expect(keyPair).not.toBeNull();
    expect(keyPair.publicKey).not.toBeNull();
    expect(keyPair.privateKey).not.toBeNull();
  });
  test('should encrypt and decrypt well', async () => {
    const data = 'portkey';
    const keyPair = await cryptoManager.generateKeyPair();
    const encrypted = await cryptoManager.encrypt(keyPair.publicKey, data);
    expect(typeof encrypted).toBe('string');
    const decrypted = await cryptoManager.decrypt(keyPair.privateKey, encrypted);
    expect(decrypted).toEqual(data);
  });

  test('should long encrypt and decrypt well', async () => {
    const data =
      'portkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkey';
    const keyPair = await cryptoManager.generateKeyPair();
    const encrypted = await cryptoManager.encryptToLong(keyPair.publicKey, data);
    expect(typeof encrypted).toBe('string');
    const decrypted = await cryptoManager.decryptToLong(keyPair.privateKey, encrypted);
    expect(decrypted).toEqual(data);
  });
});
