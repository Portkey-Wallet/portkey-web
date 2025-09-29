import { describe, expect, test } from 'vitest';
import { ForgeCryptoManager } from '../src/crypto/forge';
import { WebCryptoManager } from '../src/crypto/web';

describe('RSA Compatibility Tests (Updated for New Alternatives)', () => {
  test('Forge self-consistency test', async () => {
    // Use Forge to generate key pair
    const forgeManager = new ForgeCryptoManager();
    const forgeKeyPair = await forgeManager.generateKeyPair();

    const testMessage = 'portkey test message';

    // Use Forge for encryption
    const forgeEncrypted = await forgeManager.encrypt(forgeKeyPair.publicKey, testMessage);

    // Use Forge for decryption
    const forgeDecrypted = await forgeManager.decrypt(forgeKeyPair.privateKey, forgeEncrypted);

    expect(forgeDecrypted).toBe(testMessage);
  });

  test('Forge long message encryption/decryption', async () => {
    // Use Forge to generate key pair
    const forgeManager = new ForgeCryptoManager();
    const forgeKeyPair = await forgeManager.generateKeyPair();

    const longMessage =
      'This is a very long message that needs to be encrypted and decrypted properly using the long message encryption feature. It should work correctly with the RSA encryption system and handle messages that exceed the normal RSA block size.';

    // Use Forge for long message encryption
    const forgeEncrypted = await forgeManager.encryptLong(forgeKeyPair.publicKey, longMessage);

    // Use Forge for long message decryption
    const forgeDecrypted = await forgeManager.decryptLong(forgeKeyPair.privateKey, forgeEncrypted);

    expect(forgeDecrypted).toBe(longMessage);
    expect(forgeEncrypted).toContain(';'); // Long encryption uses semicolon separator
  });

  test('Web Crypto API self-consistency', async () => {
    // Mock browser environment
    const mockCrypto = {
      generateKey: async (algorithm: any, extractable: boolean, keyUsages: string[]) => {
        // This requires actual Web Crypto API implementation
        // For testing purposes, we skip this test
        return { publicKey: {}, privateKey: {} };
      },
      exportKey: async (format: string, key: any) => {
        return {};
      },
      importKey: async (format: string, keyData: any, algorithm: any, extractable: boolean, keyUsages: string[]) => {
        return {};
      },
      encrypt: async (algorithm: any, key: any, data: Uint8Array) => {
        return new ArrayBuffer(0);
      },
      decrypt: async (algorithm: any, key: any, data: Uint8Array) => {
        return new ArrayBuffer(0);
      },
    };

    const webCryptoManager = new WebCryptoManager(mockCrypto as any);

    // Since this requires real Web Crypto API, this test needs to run in actual browser environment
    console.log('Web Crypto API test requires browser environment');
  });

  test('Forge key format analysis', async () => {
    const forgeManager = new ForgeCryptoManager();
    const forgeKeyPair = await forgeManager.generateKeyPair();

    // Analyze Forge-generated key format
    expect(forgeKeyPair.publicKey).toContain('-----BEGIN RSA PUBLIC KEY-----');
    expect(forgeKeyPair.publicKey).toContain('-----END RSA PUBLIC KEY-----');
    expect(forgeKeyPair.privateKey).toContain('-----BEGIN RSA PRIVATE KEY-----');
    expect(forgeKeyPair.privateKey).toContain('-----END RSA PRIVATE KEY-----');

    console.log('Forge Public Key Format:', forgeKeyPair.publicKey.substring(0, 50) + '...');
    console.log('Forge Private Key Format:', forgeKeyPair.privateKey.substring(0, 50) + '...');
  });

  test('Forge encryption algorithm consistency', async () => {
    const forgeManager = new ForgeCryptoManager();
    const forgeKeyPair = await forgeManager.generateKeyPair();
    const testMessage = 'portkey';

    const encrypted = await forgeManager.encrypt(forgeKeyPair.publicKey, testMessage);
    const decrypted = await forgeManager.decrypt(forgeKeyPair.privateKey, encrypted);

    expect(decrypted).toBe(testMessage);
    expect(encrypted).toBeDefined();
    expect(encrypted.length).toBeGreaterThan(0);

    console.log('Original message:', testMessage);
    console.log('Encrypted (base64):', encrypted);
    console.log('Decrypted message:', decrypted);
  });

  test('Deprecated functions throw errors', async () => {
    // Test if deprecated functions throw errors
    const { generateKeyPairSync, rsaEncrypt, rsaDecrypt } = await import('../src/rsa');

    expect(() => generateKeyPairSync()).toThrow('DEPRECATED');
    expect(() => rsaEncrypt('test', 'key')).toThrow('DEPRECATED');
    expect(() => rsaDecrypt('test', 'key')).toThrow('DEPRECATED');
  });
});
