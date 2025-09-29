/**
 * RSA Encryption Alternative Usage Examples
 *
 * This file demonstrates how to use Web Crypto API as an alternative to Node.js crypto module in browser environments
 */

import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt, isWebCryptoAvailable } from './rsa-web';
// import { generateKeyPairSync, rsaEncrypt, rsaDecrypt } from './rsa'; // DEPRECATED
import { ForgeCryptoManager } from './crypto/forge';

/**
 * Browser Environment RSA Encryption Example
 */
export async function browserRSAExample() {
  if (!isWebCryptoAvailable()) {
    console.error('Web Crypto API is not available');
    return;
  }

  try {
    // 1. Generate key pair
    console.log('Generating RSA key pair...');
    const keyPair = await generateWebRSAKeyPair({
      modulusLength: 2048,
      hashAlgorithm: 'SHA-256',
    });

    console.log('Public Key (JWK):', keyPair.publicKey);
    console.log('Private Key (JWK):', keyPair.privateKey);

    // 2. Encrypt message
    const message = 'Hello, Portkey!';
    console.log('Original message:', message);

    const encrypted = await webRSAEncrypt(message, keyPair.publicKey);
    console.log('Encrypted (base64):', encrypted);

    // 3. Decrypt message
    const decrypted = await webRSADecrypt(encrypted, keyPair.privateKey);
    console.log('Decrypted message:', decrypted);

    console.log('Encryption/Decryption successful:', message === decrypted);
  } catch (error) {
    console.error('Error in browser RSA example:', error);
  }
}

/**
 * Node.js Environment RSA Encryption Example (Using Forge Alternative)
 */
export async function nodeRSAExample() {
  try {
    console.log('=== Node.js RSA Example (Using Forge Alternative) ===');

    // 1. Generate key pair
    console.log('Generating RSA key pair (Forge)...');
    const forgeManager = new ForgeCryptoManager();
    const keyPair = await forgeManager.generateKeyPair();

    console.log('Public Key (PEM):', keyPair.publicKey.substring(0, 50) + '...');
    console.log('Private Key (PEM):', keyPair.privateKey.substring(0, 50) + '...');

    // 2. Encrypt message
    const message = 'Hello, Portkey!';
    console.log('Original message:', message);

    const encrypted = await forgeManager.encrypt(keyPair.publicKey, message);
    console.log('Encrypted (base64):', encrypted);

    // 3. Decrypt message
    const decrypted = await forgeManager.decrypt(keyPair.privateKey, encrypted);
    console.log('Decrypted message:', decrypted);

    console.log('Encryption/Decryption successful:', message === decrypted);
  } catch (error) {
    console.error('Error in Node.js RSA example:', error);
  }
}

/**
 * RSA Encryption Example Using Forge Library
 */
export async function forgeRSAExample() {
  try {
    const forgeManager = new ForgeCryptoManager();

    // 1. Generate key pair
    console.log('Generating RSA key pair (Forge)...');
    const keyPair = await forgeManager.generateKeyPair();

    console.log('Public Key (PEM):', keyPair.publicKey.substring(0, 50) + '...');
    console.log('Private Key (PEM):', keyPair.privateKey.substring(0, 50) + '...');

    // 2. Encrypt message
    const message = 'Hello, Portkey!';
    console.log('Original message:', message);

    const encrypted = await forgeManager.encrypt(keyPair.publicKey, message);
    console.log('Encrypted (base64):', encrypted);

    // 3. Decrypt message
    const decrypted = await forgeManager.decrypt(keyPair.privateKey, encrypted);
    console.log('Decrypted message:', decrypted);

    console.log('Encryption/Decryption successful:', message === decrypted);
  } catch (error) {
    console.error('Error in Forge RSA example:', error);
  }
}

/**
 * Compatibility Test: Verify Forge Solution Self-Consistency
 */
export async function compatibilityTest() {
  console.log('=== RSA Compatibility Test (Forge Self-Consistency) ===');

  try {
    const forgeManager = new ForgeCryptoManager();
    const testMessage = 'Compatibility test message';

    // Use Forge to generate key pair
    const forgeKeyPair = await forgeManager.generateKeyPair();

    // Use Forge for encryption
    const forgeEncrypted = await forgeManager.encrypt(forgeKeyPair.publicKey, testMessage);

    // Use Forge for decryption
    const forgeDecrypted = await forgeManager.decrypt(forgeKeyPair.privateKey, forgeEncrypted);

    console.log('Forge self-consistency:', testMessage === forgeDecrypted);

    // Test long message encryption
    const longMessage =
      'This is a very long message for testing the long message encryption feature. It should work correctly with the RSA encryption system.';
    const longEncrypted = await forgeManager.encryptLong(forgeKeyPair.publicKey, longMessage);
    const longDecrypted = await forgeManager.decryptLong(forgeKeyPair.privateKey, longEncrypted);

    console.log('Forge long message compatibility:', longMessage === longDecrypted);
  } catch (error) {
    console.error('Error in compatibility test:', error);
  }
}

// If running this file directly, execute examples
if (typeof window !== 'undefined') {
  // Browser environment
  browserRSAExample();
} else {
  // Node.js environment
  (async () => {
    await nodeRSAExample();
    await forgeRSAExample();
    await compatibilityTest();
  })();
}
