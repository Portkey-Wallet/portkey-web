// example：https://blog.itsjavi.com/how-to-mock-typescript-interfaces-with-jest
// storage example: https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/
import { describe, expect, test } from '@jest/globals';
import { IStorageSuite } from '../src/util.type';

export class StorageMock implements IStorageSuite {
  store: { [key: string]: any };
  constructor() {
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

const dataMock = JSON.stringify({ age: 18 });
const storageMethod = new StorageMock();
const itemKey = 'age';
describe('storageMethods module', () => {
  test('set item {age: 18} return {age: 18}', async () => {
    await expect(storageMethod.setItem(itemKey, dataMock)).resolves.toBeUndefined();
  });
  test('data is added into local storage', async () => {
    await storageMethod.setItem(itemKey, dataMock);
    await expect(storageMethod.getItem(itemKey)).resolves.toBe(dataMock);
  });
});
