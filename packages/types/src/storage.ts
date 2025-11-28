export interface IStorageSuite {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: string) => Promise<any>;
  removeItem: (key: string) => Promise<any>;
}
