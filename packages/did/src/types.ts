import { IGraphQLClient } from '@portkey/graphql';
import {
  GetCAHolderByManagerResult,
  RecoverStatusResult,
  RecoveryParams,
  RegisterParams,
  RegisterStatusResult,
  IHolderInfo,
  CAHolderInfo,
} from '@portkey/services';
import {
  IAccountMethods,
  IBaseWalletAccount,
  IDIDBaseWallet,
  ChainId,
  BaseWalletFactory,
  IConfig,
  SendOptions,
  TransactionStatus,
  LoginStatusEnum,
} from '@portkey/types';

export type LoginType = 'scan' | 'account';

export interface IManagerInfo {
  address: string;
  extraData: string;
}

export type EditManagerParams = {
  chainId: ChainId;
  caHash?: string;
  managerInfo?: IManagerInfo;
};

export type CheckManagerParams = {
  chainId: ChainId;
  caHash: string;
  managementAddress: string;
};

export type ScanLoginParams = EditManagerParams;

export type AccountLoginParams = Omit<RecoveryParams, 'manager'>;

export type GetHolderInfoParams = {
  caHash?: string;
  loginGuardianIdentifier?: string;
  manager?: string;
  chainId: ChainId;
};

export enum GuardianType {
  GUARDIAN_TYPE_OF_EMAIL = 0,
  GUARDIAN_TYPE_OF_PHONE = 1,
  Email = 0,
  Phone = 1,
}

export interface Verifier {
  id: string; // aelf.Hash
}

export type RegisterResult = {
  status: RegisterStatusResult | undefined;
  sessionId: string;
  error: Error | undefined;
};

export type LoginResult = {
  status: RecoverStatusResult | undefined;
  sessionId: string;
  error: Error | undefined;
};
export type LogoutResult = { transactionId: string; status?: TransactionStatus };

export interface IDIDAccountMethods extends IAccountMethods {
  login(type: 'scan', params: ScanLoginParams): Promise<true>;
  login(type: 'loginAccount', params: AccountLoginParams): Promise<LoginResult>;
  logout(params: EditManagerParams, options?: SendOptions): Promise<LogoutResult>;
  getLoginStatus(params: { chainId: ChainId; sessionId: string }): Promise<RecoverStatusResult>;
  register(params: Omit<RegisterParams, 'manager'>): Promise<RegisterResult>;
  getRegisterStatus(params: { chainId: ChainId; sessionId: string }): Promise<RegisterStatusResult>;
  getHolderInfo(params: Partial<Pick<GetHolderInfoParams, 'manager' | 'chainId'>>): Promise<GetCAHolderByManagerResult>;
  getHolderInfo(params: Omit<GetHolderInfoParams, 'manager'>): Promise<IHolderInfo>;
  getVerifierServers(chainId: ChainId): Promise<VerifierItem[]>;
  getCAHolderInfo(originChainId: ChainId): Promise<CAHolderInfo>;
  saveTempStatus(params: { chainId: ChainId; caHash: string; caAddress: string }): void;
  updateLoginStatus(params: LoginStatusEnum): void;
  /**
   * @param caHash - CA wallet hash
   * @param managementAddress - address of managementAccount
   * @param chainId - If you want to check whether the manager synchronization is completed, the chainId is the chainId of the target chain.
   *  If you want to check if the manager is removed from the Portkey wallet, the chainId is originChainId
   * @returns boolean
   */
  checkManagerIsExist(params: CheckManagerParams): Promise<boolean>;
}

export interface IDIDWallet extends IDIDBaseWallet, IDIDAccountMethods {}

export abstract class BaseDIDWallet<T extends IBaseWalletAccount = IBaseWalletAccount> extends BaseWalletFactory<T> {
  public managementAccount?: T;
}

export interface CAInfo {
  caAddress: string;
  caHash: string;
}

export interface IDID {
  didWallet: IDIDWallet;
}

export interface VerifierItem {
  id: string;
  name: string;
  imageUrl: string;
  endPoints?: string[];
  verifierAddresses?: string[];
}

export interface IDIDConfig extends IConfig {
  graphQLClient?: IGraphQLClient;
  setConfig(options: IConfig): void;
}
