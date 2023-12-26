import { IStorageSuite } from '@portkey-v1/types';

export class StorageMock implements IStorageSuite {
  store: { [key: string]: any };
  public name: string;
  constructor(name: string) {
    this.name = name;
    this.store = {};
  }
  async getItem(key: string) {
    return this.store[key];
  }
  async setItem(key: string, value: string) {
    this.store[key] = value;
  }
  async removeItem(key: string) {
    delete this.store[key];
  }
}
