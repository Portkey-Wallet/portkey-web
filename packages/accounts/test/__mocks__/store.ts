import { IStorageSuite } from '@portkey/types';

export class Store implements IStorageSuite {
  private _localStorage = {};

  async getItem(key: string) {
    return this._localStorage[key];
  }
  async setItem(key: string, value: string) {
    return (this._localStorage[key] = value);
  }
  async removeItem(key: string) {
    const result = this._localStorage[key];
    delete this._localStorage[key];
    return result;
  }
}
