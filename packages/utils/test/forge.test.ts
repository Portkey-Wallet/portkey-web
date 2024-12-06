import { test } from 'vitest';
import { expect } from 'vitest';
import { describe } from 'node:test';
import { ForgeCryptoManager } from '../src/crypto/forge';

describe('WebCryptoManager', () => {
  const cryptoManager = new ForgeCryptoManager();
  test('should get keypair', async () => {
    const keyPair = await cryptoManager.generateKeyPair();
    expect(keyPair).not.toBeNull();
    expect(keyPair.publicKey).not.toBeNull();
    expect(keyPair.privateKey).not.toBeNull();
  });
  test('should encrypt and decrypt well', async () => {
    const data = 'portkey';
    const keyPair = await cryptoManager.generateKeyPair();
    const cryptoManagerPublic = new ForgeCryptoManager();

    const encrypted = await cryptoManagerPublic.encrypt(keyPair.publicKey, data);

    expect(typeof encrypted).toBe('string');
    const cryptoManagerPrivateKey = new ForgeCryptoManager();

    const decrypted = await cryptoManagerPrivateKey.decrypt(keyPair.privateKey, encrypted);
    expect(decrypted).toEqual(data);
  });

  test('should long encrypt and decrypt well', async () => {
    const data =
      'portkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkeyportkey';
    const keyPair = await cryptoManager.generateKeyPair();
    const encrypted = await cryptoManager.encryptLong(keyPair.publicKey, data);
    expect(typeof encrypted).toBe('string');
    const decrypted = await cryptoManager.decryptLong(keyPair.privateKey, encrypted);
    expect(decrypted).toEqual(data);
  });
});
