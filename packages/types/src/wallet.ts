import type { ec } from 'elliptic';
import { IStorageSuite } from './storage';

export interface IAccountMethods {
  signTransaction: <T extends Record<string, unknown>>(tx: T) => Promise<T & ISignature>;
  sign(data: string): Buffer;
  encrypt(password: string, options?: Record<string, unknown>): Promise<IKeyStore>;
}

export interface IAccountProvider<T> {
  privateKeyToAccount: (privateKey: string) => T;
  create: () => T;
  decrypt: (keystore: IKeyStore, password: string, options?: Record<string, unknown>) => Promise<T>;
}

export interface IBlockchainWallet {
  BIP44Path: string;
  address: string;
  childWallet: IBlockchainWallet | string;
  keyPair: ec.KeyPair;
  mnemonic: string;
  privateKey: string;
}

export interface IBaseWalletAccount extends IAccountMethods {
  [key: string]: unknown;
  readonly wallet: IBlockchainWallet;
  readonly address: string;
  readonly privateKey: string;
}

export interface IBaseWallet<T extends IBaseWalletAccount> {
  create(numberOfAccounts: number): this;
  add(account: T | string): this;
  get(addressOrIndex: string | number): T | undefined;
  remove(addressOrIndex: string | number): boolean;
  clear(): this;
  encrypt(password: string, options?: Record<string, unknown>): Promise<IKeyStore[]>;
  decrypt(encryptedWallets: IKeyStore[], password: string, options?: Record<string, unknown>): Promise<this>;
  save(password: string, keyName?: string): Promise<boolean | never>;
  load(password: string, keyName?: string): Promise<this | never>;
}

export interface IDIDBaseWallet {
  create(): this;
  save(password: string, keyName?: string): Promise<boolean | never>;
  load(password: string, keyName?: string): Promise<this | never>;
}

export abstract class BaseWalletFactory<T extends IBaseWalletAccount> extends Array<T> {
  protected readonly _accountProvider: IAccountProvider<T>;
  protected readonly _storage?: IStorageSuite;
  public constructor(accountProvider: IAccountProvider<T>, storage?: IStorageSuite) {
    super();
    this._accountProvider = accountProvider;
    this._storage = storage;
  }
}

export abstract class BaseWallet<T extends IBaseWalletAccount> extends BaseWalletFactory<T> implements IBaseWallet<T> {
  public abstract create(numberOfAccounts: number): this;
  public abstract add(account: T | string): this;
  public abstract get(addressOrIndex: string | number): T | undefined;
  public abstract remove(addressOrIndex: string | number): boolean;
  public abstract clear(): this;
  public abstract encrypt(password: string, options?: Record<string, unknown>): Promise<IKeyStore[]>;
  public abstract decrypt(
    encryptedWallets: IKeyStore[],
    password: string,
    options?: Record<string, unknown>,
  ): Promise<this>;
  public abstract save(password: string, keyName?: string): Promise<boolean | never>;
  public abstract load(password: string, keyName?: string): Promise<this | never>;
}

interface ICrypto {
  cipher: string;
  cipherparams: {
    iv: string;
  };
  ciphertext: string;
  kdf: string;
  kdfparams: {
    dklen: number;
    n: number;
    r: number;
    p: number;
    salt: string;
  };
  mac: string;
  mnemonicEncrypted: string;
}

export interface IKeyStore {
  version: number;
  type: string;
  nickName?: string;
  address: string;
  crypto: ICrypto;
}

export interface ISignature {
  signature: Buffer;
}

export interface IReferralInfo {
  referralCode?: string;
  projectCode?: string;
}
