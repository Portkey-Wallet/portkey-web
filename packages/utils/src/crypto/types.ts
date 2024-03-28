export interface KeyPairJSON {
  publicKey: string;
  privateKey: string;
}

export interface ICryptoManager {
  generateKeyPair(): Promise<KeyPairJSON>;
  encrypt(cryptoKey: string, data: string): Promise<string>;
  decrypt(cryptoKey: string, data: string): Promise<string>;
  encryptLong(cryptoKey: string, data: string): Promise<string>;
  decryptLong(cryptoKey: string, data: string): Promise<string>;
}
