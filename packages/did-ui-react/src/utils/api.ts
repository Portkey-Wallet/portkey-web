import { SendVerificationCodeParams } from '@portkey/services';
import { IStorageSuite } from '@portkey/types';
import { did } from './did';
import { BaseAsyncStorage } from './BaseAsyncStorage';
import { portkeyDidUIPrefix } from '../constants';

export abstract class StorageBaseLoader {
  protected readonly _store: IStorageSuite;
  public constructor(store: IStorageSuite) {
    this._store = store;
  }
  public abstract load(): void;
  public abstract save(): void;
}

const IntervalErrorMessage = 'The interval between sending two verification codes is less than 60s';

type VerifierInfo = {
  verifierSessionId: string;
  time: number;
};

export class Verification extends StorageBaseLoader {
  private readonly _defaultKeyName = `${portkeyDidUIPrefix}verification`;
  private readonly _expirationTime = 60 * 1000;
  public verifierMap: {
    [key: string]: VerifierInfo;
  };
  constructor(store: IStorageSuite) {
    super(store);
    this.verifierMap = {};
    this.load();
  }
  public async load() {
    try {
      const storageVerifierMap = await this._store.getItem(this._defaultKeyName);
      if (storageVerifierMap) this.verifierMap = JSON.parse(storageVerifierMap);
      if (typeof this.verifierMap !== 'object') this.verifierMap = {};
    } catch (error) {
      console.log(error, '====load-verification');
    }
  }
  public async save() {
    this._store.setItem(this._defaultKeyName, JSON.stringify(this.verifierMap));
  }
  public get(key: string) {
    const info = this.verifierMap[key];
    if (!info) return;
    const endTime = info.time + this._expirationTime;
    if (endTime > Date.now()) {
      return info;
    } else {
      delete this.verifierMap[key];
      this.save();
    }
  }
  public async set(key: string, value: VerifierInfo) {
    this.verifierMap[key] = value;
    await this.save();
  }
  public async sendVerificationCode(config: SendVerificationCodeParams) {
    const { guardianIdentifier, verifierId } = config;
    const key = guardianIdentifier || '' + verifierId || '';
    try {
      const req = await did.services.getVerificationCode(config);
      await this.set(key, { ...req, time: Date.now() });
      return req;
    } catch (error: any) {
      const { message } = error?.error || error || {};
      const item = this.get(key);
      if (message === IntervalErrorMessage && item) return item;
      throw error;
    }
  }
}

const storage = new BaseAsyncStorage();

export let verification = new Verification(storage);

export const setVerification = (storage: IStorageSuite) => {
  verification = new Verification(storage);
};
