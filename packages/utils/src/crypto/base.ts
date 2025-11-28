import { ICryptoManager, KeyPairJSON } from './types';
import { sliceCryptoStr } from './utils';

export abstract class BaseCryptoManager implements ICryptoManager {
  abstract generateKeyPair(): Promise<KeyPairJSON>;
  abstract encrypt(cryptoKey: string, data: string): Promise<string>;
  abstract decrypt(cryptoKey: string, data: string): Promise<string>;
  public encryptLong = async (cryptoKey: string, data: string, isHex: boolean = true): Promise<string> => {
    if (isHex) {
      data = Buffer.from(data).toString('hex');
    }
    const list = sliceCryptoStr(data, 64);
    const num = list.length;
    let str = '';
    for (let i = 0; i < num; i++) {
      const value = list[i];
      str += await this.encrypt(cryptoKey, value);
      str += ';';
    }
    if (str.length > 0) str = str.slice(0, str.length - 1);
    return str;
  };
  public decryptLong = async (cryptoKey: string, data: string, isHex: boolean = true): Promise<string> => {
    const list = data.split(';');
    let str = '';
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      str += await this.decrypt(cryptoKey, element);
    }
    if (isHex) return Buffer.from(str, 'hex').toString();
    return str;
  };
}
