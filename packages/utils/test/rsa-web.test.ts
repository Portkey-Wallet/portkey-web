import { describe, expect, test, vi } from 'vitest';
import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt, isWebCryptoAvailable } from '../src/rsa-web';

// Mock Web Crypto API for testing
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
};

// Mock window.crypto
Object.defineProperty(global, 'window', {
  value: {
    crypto: mockCrypto,
  },
  writable: true,
});

describe('Web RSA Tests', () => {
  test('isWebCryptoAvailable should return true when crypto is available', () => {
    expect(isWebCryptoAvailable()).toBe(true);
  });

  test('isWebCryptoAvailable should return false when crypto is not available', () => {
    // @ts-ignore
    global.window = undefined;
    expect(isWebCryptoAvailable()).toBe(false);

    // Restore for other tests
    Object.defineProperty(global, 'window', {
      value: {
        crypto: mockCrypto,
      },
      writable: true,
    });
  });

  test('generateWebRSAKeyPair should throw error when crypto is not available', async () => {
    // @ts-ignore
    global.window = undefined;

    await expect(generateWebRSAKeyPair()).rejects.toThrow('Web Crypto API is not available');

    // Restore for other tests
    Object.defineProperty(global, 'window', {
      value: {
        crypto: mockCrypto,
      },
      writable: true,
    });
  });

  test('webRSAEncrypt should throw error when crypto is not available', async () => {
    // @ts-ignore
    global.window = undefined;

    await expect(webRSAEncrypt('test', '{}')).rejects.toThrow('Web Crypto API is not available');

    // Restore for other tests
    Object.defineProperty(global, 'window', {
      value: {
        crypto: mockCrypto,
      },
      writable: true,
    });
  });

  test('webRSADecrypt should throw error when crypto is not available', async () => {
    // @ts-ignore
    global.window = undefined;

    await expect(webRSADecrypt('test', '{}')).rejects.toThrow('Web Crypto API is not available');

    // Restore for other tests
    Object.defineProperty(global, 'window', {
      value: {
        crypto: mockCrypto,
      },
      writable: true,
    });
  });

  test('should handle default options correctly', async () => {
    const mockKeyPair = {
      publicKey: { kty: 'RSA', n: 'test', e: 'AQAB' },
      privateKey: { kty: 'RSA', n: 'test', e: 'AQAB', d: 'test' },
    };

    mockCrypto.subtle.generateKey.mockResolvedValue({
      publicKey: {},
      privateKey: {},
    });

    mockCrypto.subtle.exportKey
      .mockResolvedValueOnce(mockKeyPair.publicKey)
      .mockResolvedValueOnce(mockKeyPair.privateKey);

    const result = await generateWebRSAKeyPair();

    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('privateKey');
    expect(result.publicKey).toBe(JSON.stringify(mockKeyPair.publicKey));
    expect(result.privateKey).toBe(JSON.stringify(mockKeyPair.privateKey));
  });

  test('should handle custom options correctly', async () => {
    const mockKeyPair = {
      publicKey: { kty: 'RSA', n: 'test', e: 'AQAB' },
      privateKey: { kty: 'RSA', n: 'test', e: 'AQAB', d: 'test' },
    };

    mockCrypto.subtle.generateKey.mockResolvedValue({
      publicKey: {},
      privateKey: {},
    });

    mockCrypto.subtle.exportKey
      .mockResolvedValueOnce(mockKeyPair.publicKey)
      .mockResolvedValueOnce(mockKeyPair.privateKey);

    const result = await generateWebRSAKeyPair({
      modulusLength: 4096,
      hashAlgorithm: 'SHA-512',
    });

    expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-512' },
      },
      true,
      ['encrypt', 'decrypt'],
    );
  });
});
