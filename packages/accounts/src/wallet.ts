import { IAccountProvider, BaseWallet, IBaseWalletAccount, IKeyStore, IStorageSuite } from '@portkey/types';

import { isNullish } from '@portkey/validator';

export class Wallet<T extends IBaseWalletAccount = IBaseWalletAccount> extends BaseWallet<T> {
  private readonly _addressMap = new Map<string, number>();
  private readonly _defaultKeyName = 'portkey_sdk_wallet';
  public constructor(accountProvider: IAccountProvider<T>, storage: IStorageSuite) {
    super(accountProvider, storage);
  }

  public create(numberOfAccounts: number): this {
    for (let i = 0; i < numberOfAccounts; i++) {
      this.add(this._accountProvider.create());
    }
    return this;
  }
  public add(account: T | string): this {
    if (typeof account === 'string') {
      return this.add(this._accountProvider.privateKeyToAccount(account));
    }
    let index = this.length;
    const existAccount = this.get(account.address);
    if (existAccount) {
      console.warn(`Account ${account.address.toLowerCase()} already exists.`);
      index = this._addressMap.get(account.address.toLowerCase()) ?? index;
    }
    this._addressMap.set(account.address.toLowerCase(), index);
    this[index] = account;
    return this;
  }

  public get(addressOrIndex: string | number): T | undefined {
    if (typeof addressOrIndex === 'string') {
      const index = this._addressMap.get(addressOrIndex.toLowerCase());

      if (!isNullish(index)) {
        return this[index];
      }

      return undefined;
    }

    return this[addressOrIndex];
  }
  public remove(addressOrIndex: string | number): boolean {
    if (typeof addressOrIndex === 'string') {
      const index = this._addressMap.get(addressOrIndex.toLowerCase());
      if (isNullish(index)) {
        return false;
      }
      this._addressMap.delete(addressOrIndex.toLowerCase());
      this.splice(index, 1);

      return true;
    }

    if (this[addressOrIndex]) {
      this.splice(addressOrIndex, 1);
      return true;
    }

    return false;
  }
  public clear() {
    this._addressMap.clear();

    // Setting length clears the Array in JS.
    this.length = 0;

    return this;
  }
  public async encrypt(password: string, options?: Record<string, unknown>): Promise<IKeyStore[]> {
    return Promise.all(this.map(async (account: T) => account.encrypt(password, options)));
  }

  public async decrypt(
    encryptedWallets: IKeyStore[],
    password: string,
    options?: Record<string, unknown>,
  ): Promise<this> {
    const results = await Promise.all(
      encryptedWallets.map(async (wallet: IKeyStore) => this._accountProvider.decrypt(wallet, password, options)),
    );
    for (const res of results) {
      this.add(res);
    }
    return this;
  }

  /**
   * Stores the wallet encrypted and as string in storage.
   *
   * @param password - The password to encrypt the wallet
   * @param keyName - (optional) The key used for the storage position, defaults to `"portkey-sdk_wallet"`.
   * @returns Will return boolean value true if saved properly
   */
  public async save(password: string, keyName?: string): Promise<boolean> {
    if (!this._storage) throw new Error('Please set storage first');
    await this._storage.setItem(keyName ?? this._defaultKeyName, JSON.stringify(await this.encrypt(password)));
    return true;
  }

  /**
   * Loads a wallet from storage and decrypts it.
   *
   * @param password - The password to decrypt the wallet.
   * @param keyName - (optional)The key used for storage position, defaults to `portkey-sdk_wallet"`
   * @returns Returns the wallet object
   */
  public async load(password: string, keyName?: string): Promise<this> {
    if (!this._storage) throw new Error('Please set storage first');
    const keystore = await this._storage.getItem(keyName ?? this._defaultKeyName);
    if (keystore) {
      await this.decrypt((JSON.parse(keystore) as IKeyStore[]) || [], password);
    }
    return this;
  }
}
