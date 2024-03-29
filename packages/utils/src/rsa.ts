import crypto from 'crypto';

export function rsaEncrypt(message: string, publicKey: string) {
  const buffer = Buffer.from(message, 'utf8');
  const encrypted = crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, buffer);
  return encrypted.toString('base64');
}
export function rsaDecrypt(base64Message: string, privateKey: string) {
  const buffer = Buffer.from(base64Message, 'base64');
  const decrypted = crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    buffer,
  );
  return decrypted.toString('utf8');
}
export function generateKeyPairSync(modulusLength = 1024) {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
}

// (async () => {
//   const keyPair = generateKeyPairSync();
//   console.log(keyPair, '====keyPair');
//   const m = 'portkey';
//   const str = rsaEncrypt(m, keyPair.publicKey);
//   const m2 = rsaDecrypt(str, keyPair.privateKey);
//   console.log(m2, '====m2');
// })();
