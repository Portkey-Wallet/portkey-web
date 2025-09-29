/**
 * Web Crypto API implementation for RSA encryption/decryption
 * This is a browser-compatible alternative to Node.js crypto module
 */

export interface WebRSAKeyPair {
  publicKey: string; // JWK format
  privateKey: string; // JWK format
}

export interface WebRSAOptions {
  modulusLength?: number;
  hashAlgorithm?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
}

/**
 * Generate RSA key pair using Web Crypto API
 * @param options - Key generation options
 * @returns Promise<WebRSAKeyPair> - Key pair in JWK format
 */
export async function generateWebRSAKeyPair(options: WebRSAOptions = {}): Promise<WebRSAKeyPair> {
  const { modulusLength = 2048, hashAlgorithm = 'SHA-256' } = options;

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: `SHA-${hashAlgorithm.split('-')[1]}` },
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const publicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return {
    publicKey: JSON.stringify(publicKey),
    privateKey: JSON.stringify(privateKey),
  };
}

/**
 * Encrypt message using Web Crypto API
 * @param message - Message to encrypt
 * @param publicKey - Public key in JWK format
 * @param hashAlgorithm - Hash algorithm for OAEP
 * @returns Promise<string> - Base64 encoded encrypted message
 */
export async function webRSAEncrypt(
  message: string,
  publicKey: string,
  hashAlgorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256',
): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const keyData = typeof publicKey === 'string' ? JSON.parse(publicKey) : publicKey;

  const cryptoKey = await window.crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: { name: `SHA-${hashAlgorithm.split('-')[1]}` },
    },
    true,
    ['encrypt'],
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    cryptoKey,
    new TextEncoder().encode(message),
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

/**
 * Decrypt message using Web Crypto API
 * @param base64Message - Base64 encoded encrypted message
 * @param privateKey - Private key in JWK format
 * @param hashAlgorithm - Hash algorithm for OAEP
 * @returns Promise<string> - Decrypted message
 */
export async function webRSADecrypt(
  base64Message: string,
  privateKey: string,
  hashAlgorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256',
): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const keyData = typeof privateKey === 'string' ? JSON.parse(privateKey) : privateKey;

  const cryptoKey = await window.crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: { name: `SHA-${hashAlgorithm.split('-')[1]}` },
    },
    true,
    ['decrypt'],
  );

  const encryptedData = Uint8Array.from(atob(base64Message), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    cryptoKey,
    encryptedData,
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Convert PEM format key to JWK format (for compatibility with existing Node.js keys)
 * Note: This is a simplified conversion and may not work with all PEM formats
 * @param pemKey - PEM formatted key
 * @returns Promise<string> - JWK formatted key
 */
export async function pemToJwk(_pemKey: string): Promise<string> {
  // This is a placeholder implementation
  // In practice, you would need a proper PEM to JWK converter
  // or use a library like 'pem-jwk' or 'node-forge'
  throw new Error('PEM to JWK conversion not implemented. Use generateWebRSAKeyPair() for new keys.');
}

/**
 * Check if Web Crypto API is available
 * @returns boolean - True if Web Crypto API is available
 */
export function isWebCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;
}
