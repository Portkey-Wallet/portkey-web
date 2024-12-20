import { IPortkeyContract, getContractBasic } from '@portkey/contracts';
import {
  CAHolderInfo,
  ChainInfo,
  GetCAHolderByManagerResult,
  ICommunityRecoveryService,
  IConnectService,
  IHolderInfo,
  RecoverStatusResult,
  RegisterParams,
  RegisterStatusResult,
} from '@portkey/services';
import {
  IBaseWalletAccount,
  IKeyStore,
  ISignature,
  IAccountProvider,
  IStorageSuite,
  ChainId,
  SendOptions,
  ChainIdMap,
  LoginStatusEnum,
} from '@portkey/types';
import { aes, aelf } from '@portkey/utils';
import {
  AccountLoginParams,
  BaseDIDWallet,
  CAInfo,
  CheckManagerParams,
  EditManagerParams,
  GetHolderInfoParams,
  IDIDWallet,
  LoginResult,
  LoginType,
  LogoutResult,
  RegisterResult,
  ScanLoginParams,
  VerifierItem,
  SendMultiTransactionParams,
} from './types';
import AElf from 'aelf-sdk';

export class DIDWallet<T extends IBaseWalletAccount> extends BaseDIDWallet<T> implements IDIDWallet {
  private readonly _defaultKeyName = 'portkey_sdk_did_wallet_v2';
  public managementAccount?: T;
  public services: ICommunityRecoveryService;
  public connectServices?: IConnectService;
  public contracts: { [key: string]: IPortkeyContract };
  public chainsInfo?: { [key: string]: ChainInfo };
  /** @deprecated Please use aaInfo instead  */
  public caInfo: { [key: string]: CAInfo };
  /** @deprecated Please use aaInfo instead  */
  public accountInfo: { loginAccount?: string; nickName?: string };
  public aaInfo: { accountInfo?: CAInfo; nickName?: string };
  public originChainId?: ChainId;
  public isLoginStatus?: LoginStatusEnum;
  public sessionId?: string;
  constructor({
    accountProvider,
    storage,
    service,
    connectService,
  }: {
    accountProvider: IAccountProvider<T>;
    storage?: IStorageSuite;
    service: ICommunityRecoveryService;
    connectService?: IConnectService;
  }) {
    super(accountProvider, storage);
    this.services = service;
    this.connectServices = connectService;
    this.contracts = {};
    this.caInfo = {};
    this.accountInfo = {};
    this.aaInfo = {};
    this.isLoginStatus = LoginStatusEnum.INIT;
    this.sessionId = '';
  }
  public async getVerifierServers(chainId: ChainId): Promise<VerifierItem[]> {
    const result = await this.services.getVerifierServers(chainId);
    return result.guardianVerifierServers;
  }
  login(type: 'scan', params: ScanLoginParams): Promise<true>;
  login(type: 'loginAccount', params: AccountLoginParams): Promise<LoginResult>;
  public async login(type: any, params: any): Promise<any> {
    if (!this.managementAccount) this.create();
    if ((type as LoginType) === 'scan') {
      if (!this.accountInfo.loginAccount) throw new Error('account not logged in');
      const _params = params as ScanLoginParams;
      const req = await this.addManager(_params);
      if (req?.error) throw req.error;
      return true;
    } else {
      if (this.accountInfo.loginAccount) throw new Error('account already exists');
      const _params = params as AccountLoginParams;
      const { sessionId } = await this.services.recovery({
        ..._params,
        manager: this.managementAccount?.address as string,
      });
      this.sessionId = sessionId;
      let status, error;
      try {
        status = await this.services.getRecoverStatus(sessionId);
        const { caAddress, caHash, recoveryStatus } = status;
        if (recoveryStatus === 'pass') {
          this.accountInfo = { loginAccount: _params.loginGuardianIdentifier };
          this.caInfo[_params.chainId] = { caAddress, caHash };
        } else {
          throw new Error((status as RecoverStatusResult).recoveryMessage);
        }
      } catch (e) {
        error = e;
      }
      return { sessionId, status, error };
    }
  }

  public async getLoginStatus({
    sessionId,
    chainId,
  }: {
    sessionId: string;
    chainId: ChainId;
  }): Promise<RecoverStatusResult> {
    const status = await this.services.getRecoverStatus(sessionId);
    if (status?.recoveryStatus === 'pass' && this.managementAccount?.address && !this.caInfo?.[chainId]) {
      this.accountInfo = { loginAccount: status.caHash };
      this.caInfo[chainId] = { caAddress: status.caAddress, caHash: status.caHash };
      this.aaInfo = { accountInfo: { caAddress: status.caAddress, caHash: status.caHash } };
      this.originChainId = chainId;
    }

    if (status?.recoveryStatus === 'pass') {
      this.isLoginStatus = LoginStatusEnum.SUCCESS;
    }
    return status;
  }
  public async register(params: Omit<RegisterParams, 'manager'>): Promise<RegisterResult> {
    if (this.accountInfo.loginAccount) throw new Error('account already exists');
    if (!this.managementAccount) this.create();
    const { sessionId } = await this.services.register({
      ...params,
      manager: this.managementAccount?.address as string,
    });
    this.sessionId = sessionId;
    let status, error: any;
    try {
      status = await this.services.getRegisterStatus(sessionId);
      const { caAddress, caHash, registerStatus } = status;
      if (registerStatus === 'pass') {
        this.accountInfo = { loginAccount: params.loginGuardianIdentifier };
        this.caInfo[params.chainId] = { caAddress, caHash };
      } else {
        throw new Error((status as RegisterStatusResult).registerMessage);
      }
    } catch (e) {
      error = e;
    }
    return { sessionId, status, error };
  }
  public async getRegisterStatus({
    sessionId,
    chainId,
  }: {
    sessionId: string;
    chainId: ChainId;
  }): Promise<RegisterStatusResult> {
    const status = await this.services.getRegisterStatus(sessionId);
    if (status?.registerStatus === 'pass' && this.managementAccount?.address && !this.caInfo?.[chainId]) {
      this.accountInfo = { loginAccount: status.caHash };
      this.aaInfo = { accountInfo: { caAddress: status.caAddress, caHash: status.caHash } };
      this.originChainId = chainId;
      this.caInfo[chainId] = { caAddress: status.caAddress, caHash: status.caHash };
    }
    if (status?.registerStatus === 'pass') {
      this.isLoginStatus = LoginStatusEnum.SUCCESS;
    }
    return status;
  }
  public saveTempStatus({
    chainId,
    caAddress,
    caHash,
    sessionId,
  }: {
    chainId: ChainId;
    caAddress: string;
    caHash: string;
    sessionId: string;
  }) {
    this.accountInfo = { loginAccount: caHash };
    this.aaInfo = { accountInfo: { caAddress: caAddress, caHash: caHash } };
    this.originChainId = chainId;
    this.caInfo[chainId] = { caAddress: caAddress, caHash: caHash };
    this.sessionId = sessionId;
  }
  async getVerifierServersByContract(chainId: ChainId): Promise<VerifierItem[]> {
    if (!this.managementAccount) this.create();
    const contract = await this.getContractByChainInfo(chainId);
    const req = await contract.callViewMethod('GetVerifierServers', '');
    if (req.error) throw req.error;
    return req.data?.verifierServers;
  }
  public async getContract({ contractAddress, rpcUrl }: { contractAddress: string; rpcUrl: string }) {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    const key = contractAddress + rpcUrl + this.managementAccount.address;
    if (!this.contracts[key])
      this.contracts[key] = await getContractBasic({
        account: this.managementAccount.wallet,
        rpcUrl,
        contractAddress,
      });
    return this.contracts[key];
  }
  public async getContractByChainInfo(chainId: string) {
    if (!this.chainsInfo) await this.getChainsInfo();
    const chainInfo = this.chainsInfo?.[chainId];
    if (!chainInfo) throw new Error(`${chainId} chainInfo does not exist`);
    return this.getContract({
      contractAddress: chainInfo.caContractAddress,
      rpcUrl: chainInfo.endPoint,
    });
  }
  public async addManager(params: EditManagerParams) {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    const { chainId, ...contractParams } = params;
    const contract = await this.getContractByChainInfo(chainId);
    const req = await contract.callSendMethod('AddManagerInfo', this.managementAccount.address, contractParams);
    if (req.error) throw req.error;
    return req.data;
  }
  public async removeManager(params: EditManagerParams, sendOption?: SendOptions) {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    const { chainId, ...contractParams } = params;
    const contract = await this.getContractByChainInfo(chainId);
    const req = await contract.callSendMethod(
      'RemoveManagerInfo',
      this.managementAccount.address,
      contractParams,
      sendOption,
    );
    if (req.error) throw req.error;
    // delete current manager
    if (
      params.managerInfo?.address === this.managementAccount.address &&
      this.caInfo[chainId].caHash === params.caHash
    ) {
      this.caInfo = {};
      this.accountInfo = {};
    }
    if (sendOption?.onMethod === 'transactionHash') return req;
    return req.data;
  }
  getHolderInfo(params: Partial<Pick<GetHolderInfoParams, 'manager' | 'chainId'>>): Promise<GetCAHolderByManagerResult>;
  getHolderInfo(params: Omit<GetHolderInfoParams, 'manager'>): Promise<IHolderInfo>;
  public async getHolderInfo(params: GetHolderInfoParams) {
    const { manager, chainId, ...managerInfo } = params;
    if (manager || (!managerInfo.caHash && !managerInfo.loginGuardianIdentifier)) {
      let _manager = manager;
      if (!_manager && this.managementAccount) _manager = this.managementAccount.address;
      if (!_manager) throw new Error('not manager');
      const req = await this.services.getHolderInfoByManager({ manager: _manager, chainId });
      const info = req[0];
      // get current manager info
      if (info && _manager === this.managementAccount?.address && info.caAddress && info.caHash) {
        this.caInfo[info.chainId || chainId] = { caAddress: info.caAddress, caHash: info.caHash };
        const loginAccount = info.loginGuardianInfo[0]?.loginGuardian?.identifierHash;
        if (!this.accountInfo.loginAccount && loginAccount) this.accountInfo = { loginAccount: loginAccount };
      }
      return req;
    } else {
      const result = await this.services.getHolderInfo({
        ...params,
        guardianIdentifier: params.loginGuardianIdentifier,
      });
      // get current account info
      if (result && result?.caHash === this.aaInfo?.accountInfo?.caHash) {
        const { caAddress, caHash } = result;
        this.caInfo[chainId] = { caAddress, caHash };
      }
      return result;
    }
  }
  async getHolderInfoByContract(params: Omit<GetHolderInfoParams, 'manager'>): Promise<IHolderInfo> {
    const contract = await this.getContractByChainInfo(params.chainId);
    const req = await contract.callViewMethod('GetHolderInfo', { caHash: params.caHash });
    if (req.error) throw req.error;
    return req.data;
  }
  public async getChainsInfo() {
    const chainList = await this.services.getChainsInfo();
    const chainsInfo = {};
    chainList.forEach(chainInfo => {
      chainsInfo[chainInfo.chainId] = chainInfo;
    });
    this.chainsInfo = chainsInfo;
    return this.chainsInfo;
  }
  async logout(params: EditManagerParams, sendOption?: SendOptions): Promise<LogoutResult> {
    if (!this.managementAccount) throw new Error('ManagerAccount does not exist, please login.');
    if (!this.chainsInfo) await this.getChainsInfo();
    if (!params.caHash && this.caInfo[params.chainId]) params.caHash = this.caInfo[params.chainId].caHash;
    if (!params.managerInfo)
      params.managerInfo = {
        address: this.managementAccount.address,
        extraData: 'extraData',
      };
    if (!params.caHash) throw new Error('caHash does not exist');
    const req = await this.removeManager(params, sendOption);
    return { status: req?.Status, transactionId: req?.transactionId || req?.TransactionId };
  }
  public async getCAHolderInfo(originChainId: ChainId): Promise<CAHolderInfo> {
    if (!this.connectServices) throw new Error('connectServices does not exist');
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    const caHash = this.caInfo[originChainId]?.caHash;
    const caAddress = this.caInfo[originChainId]?.caAddress;
    if (!caHash) throw new Error('caHash does not exist');
    const timestamp = Date.now();
    const message = Buffer.from(`${this.managementAccount.address}-${timestamp}`).toString('hex');
    const signature = this.managementAccount.sign(message).toString('hex');
    const pubkey = this.managementAccount.wallet.keyPair.getPublic('hex');
    const config = {
      grant_type: 'signature',
      client_id: 'CAServer_App',
      scope: 'CAServer',
      signature: signature,
      pubkey,
      timestamp,
      ca_hash: caHash,
      chain_id: originChainId,
    };
    const info = await this.connectServices.getConnectToken(config);

    const caHolderInfo = await this.services.getCAHolderInfo(`Bearer ${info.access_token}`, caHash);
    if (caHolderInfo.nickName) {
      this.accountInfo = { ...this.accountInfo, nickName: caHolderInfo.nickName };
      this.aaInfo = { accountInfo: { caHash, caAddress }, ...this.aaInfo, nickName: caHolderInfo.nickName };
      this.originChainId = originChainId;
    }
    return caHolderInfo;
  }
  public async signTransaction<T extends Record<string, unknown>>(
    tx: Record<string, unknown>,
  ): Promise<T & ISignature> {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    return this.managementAccount.signTransaction(tx as any);
  }
  sign(data: string): Buffer {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    return this.managementAccount.sign(data);
  }
  encrypt(password: string, options?: Record<string, unknown> | undefined): Promise<IKeyStore> {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    return this.managementAccount.encrypt(password, options);
  }
  aesEncrypt(password: string): Promise<string> {
    if (!this.managementAccount) throw new Error('managerAccount does not exist');
    return AElf.wallet.AESEncrypt(this.managementAccount.privateKey, password);
  }
  public create(): this {
    this.managementAccount = this._accountProvider.create();
    return this;
  }
  public createByPrivateKey(privateKey: string): this {
    this.managementAccount = this._accountProvider.privateKeyToAccount(privateKey);
    return this;
  }
  public async save(password: string, keyName?: string | undefined): Promise<boolean> {
    if (!this._storage) throw new Error('Please set storage first');
    const aesPrivateKey = await this.aesEncrypt(password);
    const data = JSON.stringify({
      aesPrivateKey,
      caInfo: this.caInfo,
      accountInfo: this.accountInfo,
      aaInfo: this.aaInfo,
      originChainId: this.originChainId,
      isLoginStatus: this.isLoginStatus,
      sessionId: this.sessionId,
    });
    const aesStr = aes.encrypt(data, password);
    await this._storage.setItem(keyName ?? this._defaultKeyName, aesStr);
    return true;
  }
  public async load(password: string, keyName?: string | undefined): Promise<this> {
    if (!this._storage) throw new Error('Please set storage first');
    const aesStr = await this._storage.getItem(keyName ?? this._defaultKeyName);
    if (aesStr) {
      const data = aes.decrypt(aesStr, password);
      if (data) {
        const { aesPrivateKey, caInfo, accountInfo, aaInfo, originChainId, isLoginStatus, sessionId } =
          JSON.parse(data);
        const privateKey = aes.decrypt(aesPrivateKey, password);
        if (aesPrivateKey && privateKey) {
          this.managementAccount = await this._accountProvider.privateKeyToAccount(privateKey);
          this.caInfo = caInfo || {};
          this.accountInfo = accountInfo || {};
          this.aaInfo = aaInfo || {};
          this.originChainId = originChainId;
          this.isLoginStatus = isLoginStatus;
          this.sessionId = sessionId;
        }
      }
    }
    return this;
  }
  public reset() {
    this.contracts = {};
    this.caInfo = {};
    this.accountInfo = {};
    this.aaInfo = {};
    this.managementAccount = undefined;
    this.isLoginStatus = LoginStatusEnum.INIT;
  }

  public async checkManagerIsExistByGQL(params: CheckManagerParams) {
    // Check if manager exists via GQL
    const resultByQGL = await this.services.getHolderInfoByManager({
      manager: params.managementAddress,
      chainId: params.chainId,
      caHash: params.caHash,
    });
    const info = resultByQGL[0];
    const res = Boolean(info && info.caAddress);
    if (res) {
      this.updateLoginStatus(LoginStatusEnum.SUCCESS);
    }
    return res;
  }

  public async checkManagerIsExistByContract(params: CheckManagerParams) {
    // Check if manager exists via Contract
    const resultByContract = await this.getHolderInfoByContract({
      caHash: params.caHash,
      chainId: params.chainId,
    });
    const managerInfos = resultByContract.managerInfos;
    const isExist = managerInfos?.some(manager => manager?.address === params.managementAddress);
    return Boolean(isExist);
  }

  public async checkManagerIsExist(params: CheckManagerParams) {
    return (await this.checkManagerIsExistByGQL(params)) || (await this.checkManagerIsExistByContract(params));
  }

  public updateLoginStatus(params: LoginStatusEnum) {
    this.isLoginStatus = params;
  }

  public async checkStorageAesStrIsExist(keyName?: string): Promise<boolean> {
    if (!this._storage) throw new Error('Please set storage first');
    const aesStr = await this._storage.getItem(keyName ?? this._defaultKeyName);
    return Boolean(aesStr);
  }

  public async sendMultiTransaction(params: SendMultiTransactionParams) {
    const { chainId, multiChainInfo, gatewayUrl, params: multiTransactionParamInfo } = params;
    if (!this.managementAccount?.privateKey) throw new Error('Please login first');
    if (!this.chainsInfo) await this.getChainsInfo();
    const chainInfo = this.chainsInfo?.[chainId];
    if (!chainInfo) throw new Error(`${chainId} chainInfo does not exist`);
    const transformedMultiChainInfo = Object.entries(multiChainInfo).reduce((acc, [key, value]) => {
      const chainId = ChainIdMap[key];
      if (chainId) {
        acc[chainId] = value;
      }
      return acc;
    }, {});
    const aelfInstance = aelf.getAelfInstance(chainInfo.endPoint);
    const wallet = aelf.getWallet(this.managementAccount.privateKey);
    const contractOption = {
      multi: transformedMultiChainInfo,
      gatewayUrl,
    };
    const caContract = await aelfInstance.chain.contractAt(chainInfo.caContractAddress, wallet, contractOption);
    const transformedParams = Object.entries(multiTransactionParamInfo).reduce((acc, [key, value]) => {
      const chainId = ChainIdMap[key];
      if (chainId) {
        acc[chainId] = value;
      }
      return acc;
    }, {});
    return await caContract.sendMultiTransactionToGateway(transformedParams);
  }
}
