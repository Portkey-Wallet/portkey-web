// import crypto from 'crypto';

/**
 * @deprecated This function is deprecated and will be removed in a future version.
 * Use Web Crypto API or Node-forge alternatives instead.
 *
 * For browser environments, use:
 * - generateWebRSAKeyPair() from './rsa-web'
 * - webRSAEncrypt() from './rsa-web'
 * - webRSADecrypt() from './rsa-web'
 *
 * For Node.js environments with better compatibility, use:
 * - ForgeCryptoManager from './crypto/forge'
 *
 * @see RSA_ALTERNATIVES.md for migration guide
 */
export function rsaEncrypt(message: string, publicKey: string) {
  throw new Error(`
🚨 DEPRECATED: rsaEncrypt() is no longer supported!

Please use one of these alternatives:

🌐 For Browser Environment:
  import { webRSAEncrypt } from './rsa-web';
  const encrypted = await webRSAEncrypt(message, publicKey);

🔧 For Node.js with Better Compatibility:
  import { ForgeCryptoManager } from './crypto/forge';
  const forgeManager = new ForgeCryptoManager();
  const encrypted = await forgeManager.encrypt(publicKey, message);

📚 See RSA_ALTERNATIVES.md for complete migration guide.
  `);
}

/**
 * @deprecated This function is deprecated and will be removed in a future version.
 * Use Web Crypto API or Node-forge alternatives instead.
 *
 * For browser environments, use:
 * - generateWebRSAKeyPair() from './rsa-web'
 * - webRSAEncrypt() from './rsa-web'
 * - webRSADecrypt() from './rsa-web'
 *
 * For Node.js environments with better compatibility, use:
 * - ForgeCryptoManager from './crypto/forge'
 *
 * @see RSA_ALTERNATIVES.md for migration guide
 */
export function rsaDecrypt(base64Message: string, privateKey: string) {
  throw new Error(`
🚨 DEPRECATED: rsaDecrypt() is no longer supported!

Please use one of these alternatives:

🌐 For Browser Environment:
  import { webRSADecrypt } from './rsa-web';
  const decrypted = await webRSADecrypt(base64Message, privateKey);

🔧 For Node.js with Better Compatibility:
  import { ForgeCryptoManager } from './crypto/forge';
  const forgeManager = new ForgeCryptoManager();
  const decrypted = await forgeManager.decrypt(privateKey, base64Message);

📚 See RSA_ALTERNATIVES.md for complete migration guide.
  `);
}

/**
 * @deprecated This function is deprecated and will be removed in a future version.
 * Use Web Crypto API or Node-forge alternatives instead.
 *
 * For browser environments, use:
 * - generateWebRSAKeyPair() from './rsa-web'
 * - webRSAEncrypt() from './rsa-web'
 * - webRSADecrypt() from './rsa-web'
 *
 * For Node.js environments with better compatibility, use:
 * - ForgeCryptoManager from './crypto/forge'
 *
 * @see RSA_ALTERNATIVES.md for migration guide
 */
export function generateKeyPairSync(modulusLength = 1024) {
  throw new Error(`
🚨 DEPRECATED: generateKeyPairSync() is no longer supported!

Please use one of these alternatives:

🌐 For Browser Environment:
  import { generateWebRSAKeyPair } from './rsa-web';
  const keyPair = await generateWebRSAKeyPair({ modulusLength: ${modulusLength} });

🔧 For Node.js with Better Compatibility:
  import { ForgeCryptoManager } from './crypto/forge';
  const forgeManager = new ForgeCryptoManager();
  const keyPair = await forgeManager.generateKeyPair();

📚 See RSA_ALTERNATIVES.md for complete migration guide.
  `);
}

// (async () => {
//   const keyPair = generateKeyPairSync();
//   console.log(keyPair, '====keyPair');
//   const m = 'portkey';
//   const str = rsaEncrypt(m, keyPair.publicKey);
//   const m2 = rsaDecrypt(str, keyPair.privateKey);
//   console.log(m2, '====m2');
// })();
