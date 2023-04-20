import { portkey } from '@portkey/accounts';
import {
  AccountLoginParams,
  EditManagerParams,
  GetHolderInfoParams,
  IDID,
  IDIDAccountMethods,
  LoginResult,
  RegisterResult,
  ScanLoginParams,
  VerifierItem,
} from './types';
import { DIDWallet } from './wallet';
import {
  CommunityRecovery,
  GetCAHolderByManagerResult,
  ICommunityRecoveryService,
  IHolderInfo,
  RecoverStatusResult,
  RegisterParams,
  RegisterStatusResult,
} from '@portkey/services';
import { FetchRequest } from '@portkey/request';
import { DIDGraphQL, IDIDGraphQL } from '@portkey/graphql';
import { ISignature, IKeyStore, IDIDBaseWallet, IConfig, IBaseRequest, ChainId } from '@portkey/types';
import { DIDConfig } from './config';
export class DID implements IDID, IDIDAccountMethods, IDIDBaseWallet {
  public didWallet: DIDWallet<portkey.WalletAccount>;
  public services: ICommunityRecoveryService;
  public config: DIDConfig;
  public didGraphQL: IDIDGraphQL;
  public fetchRequest: IBaseRequest;
  public accountProvider: portkey.AccountProvider;
  constructor() {
    this.accountProvider = new portkey.AccountProvider();
    this.config = new DIDConfig();
    this.fetchRequest = new FetchRequest(this.config.requestConfig);
    this.didGraphQL = new DIDGraphQL({ config: this.config });
    this.services = new CommunityRecovery(this.fetchRequest, this.didGraphQL);
    this.didWallet = new DIDWallet({
      accountProvider: this.accountProvider,
      service: this.services,
      storage: this.config.storageMethod,
    });
  }
  async getLoginStatus(params: { chainId: ChainId; sessionId: string }): Promise<RecoverStatusResult> {
    return this.didWallet.getLoginStatus(params);
  }
  async getRegisterStatus(params: { chainId: ChainId; sessionId: string }): Promise<RegisterStatusResult> {
    return this.didWallet.getRegisterStatus(params);
  }
  async getVerifierServers(chainId: ChainId): Promise<VerifierItem[]> {
    return this.didWallet.getVerifierServers(chainId);
  }
  create(): this {
    this.didWallet.create();
    return this;
  }
  public async save(password: string, keyName?: string | undefined): Promise<boolean> {
    return this.didWallet.save(password, keyName);
  }
  public async load(password: string, keyName?: string | undefined): Promise<this> {
    await this.didWallet.load(password, keyName);
    return this;
  }
  login(type: 'scan', params: ScanLoginParams): Promise<true>;
  login(type: 'loginAccount', params: AccountLoginParams): Promise<LoginResult>;
  public async login(type: any, params: any): Promise<any> {
    return this.didWallet.login(type, params);
  }
  public async logout(params: EditManagerParams): Promise<boolean> {
    return this.didWallet.logout(params);
  }
  register(params: Omit<RegisterParams, 'manager'>): Promise<RegisterResult> {
    return this.didWallet.register(params);
  }
  getHolderInfo(params: Pick<GetHolderInfoParams, 'manager'>): Promise<GetCAHolderByManagerResult>;
  getHolderInfo(params: Omit<GetHolderInfoParams, 'manager'>): Promise<IHolderInfo>;
  public async getHolderInfo(params: any): Promise<any> {
    return this.didWallet.getHolderInfo(params);
  }
  signTransaction: <T extends Record<string, unknown>>(tx: T) => Promise<T & ISignature>;
  sign(data: string): Buffer {
    return this.didWallet.sign(data);
  }
  encrypt(password: string, options?: Record<string, unknown> | undefined): Promise<IKeyStore> {
    return this.didWallet.encrypt(password, options);
  }
  aesEncrypt(password: string): Promise<string> {
    return this.didWallet.aesEncrypt(password);
  }
  setConfig(options: IConfig) {
    this.config.setConfig(options);
  }
  reset() {
    this.didWallet.reset();
  }
}
