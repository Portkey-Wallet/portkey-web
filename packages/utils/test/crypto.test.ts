import { describe, test, expect } from 'vitest';
import { webcrypto } from 'crypto';
import { WebCryptoManager } from '../src/crypto/web';
import { sliceCryptoStr } from '../src/crypto/utils';

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
    // @ts-ignore
    const cryptoManagerPublic = new WebCryptoManager(webcrypto.subtle);

    const encrypted = await cryptoManagerPublic.encrypt(keyPair.publicKey, data);

    expect(typeof encrypted).toBe('string');
    // @ts-ignore
    const cryptoManagerPrivateKey = new WebCryptoManager(webcrypto.subtle);

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

  test('test crypto utils', async () => {
    const str = '123';
    const list = sliceCryptoStr(str, 1);
    const list2 = sliceCryptoStr(str);
    expect(list[1]).toEqual('2');
    expect(list2[0]).toEqual('123');
  });
});
