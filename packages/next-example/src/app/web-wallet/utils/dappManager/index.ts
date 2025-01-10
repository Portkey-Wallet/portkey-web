import { IDappManager } from '../../types/dapp';
import { CheckManagerParams, DIDWallet } from '@portkey/did';
import { portkey } from '@portkey/accounts';
import { did, getChain } from '@portkey/did-ui-react';
import { ChainInfo, GetCAHolderByManagerParams } from '@portkey/services';
import { wallet as walletUtils } from '@portkey/utils';
import { Accounts, ChainId, ChainsInfo } from '@portkey/provider-types';
import { getChainInfoMap } from '../chainInfo';
import { getWebWalletStorageKey } from '../wallet';
export interface IBaseDappManagerProps {
  pin: string;
}

export abstract class DappManager implements IDappManager {
  protected appId: string;
  constructor({ appId }: { appId: string }) {
    this.appId = appId;
  }
  protected AAInfo?: { caHash: string; caAddress: string; chainId: ChainId }[];
  caHash(): string {
    const currentAAInfo = this.getAAInfo();
    return currentAAInfo.accountInfo?.caHash || '';
  }
  getDid() {
    return did;
  }
  isLocked(): boolean {
    console.log('=====isLocked', !did?.didWallet?.aaInfo?.accountInfo?.caHash);
    return Boolean(!did?.didWallet?.aaInfo?.accountInfo?.caHash);
  }

  getWallet() {
    console.log('getWallet did', this.getDid());
    return this.getDid()?.didWallet as DIDWallet<portkey.WalletAccount>;
  }

  async walletName(): Promise<string> {
    const currentAAInfo = await this.getAAInfo();

    return currentAAInfo.nickName || '';
  }

  async currentManagerAddress(): Promise<string | undefined> {
    return this.getWallet()?.managementAccount?.address;
  }

  getAAInfo() {
    const wallet = this.getWallet();
    return wallet.aaInfo;
  }

  async getChainInfo(chainId: ChainId): Promise<ChainInfo | undefined> {
    return getChain(chainId);
  }

  isActive() {
    return true;
  }

  // async updateManagerSyncState(chainId: ChainId) {
  //   const { currentNetwork } = await this.getWallet();
  //   this.store.dispatch(updateCASyncState({ networkType: currentNetwork, chainId }));
  // }

  async getHolderInfoByManager() {
    const wallet = this.getWallet();
    if (this.AAInfo && this.AAInfo.length >= 2) return this.AAInfo;
    const res = await did.services.getHolderInfoByManager({
      manager: wallet.managementAccount?.address,
      caHash: wallet.aaInfo.accountInfo?.caHash,
      maxResultCount: 2,
      // chainId: wallet.originChainId,
    } as unknown as GetCAHolderByManagerParams);
    console.log(res, 'res===getHolderInfoByManager');
    return res
      .filter(item => item.caAddress)
      .map(item => ({
        caHash: item.caHash as string,
        caAddress: item.caAddress as string,
        chainId: item.chainId as ChainId,
      }));
  }

  async getOriginChainId() {
    const wallet = await this.getWallet();
    let originChainId = wallet.originChainId;
    if (originChainId) return originChainId;
    const res = await this.getHolderInfoByManager();
    const caInfo = res[0];
    originChainId = caInfo?.chainId as ChainId;
    return originChainId;
  }

  isLogged() {
    return Boolean(localStorage.getItem(getWebWalletStorageKey(this.appId)));
  }

  async accounts() {
    console.log(did.didWallet, 'accounts==');
    const chains = await this.chainIds();
    const caAddress = (await this.getAAInfo()).accountInfo?.caAddress;
    if (caAddress) return chains.map(item => ({ [item]: caAddress })) as Accounts;
    const res = await this.getHolderInfoByManager();
    return res
      .filter(item => !!item.chainId)
      .map(item => ({
        [item.chainId as ChainId]: walletUtils.removeELFAddressSuffix(item.caAddress as string),
      })) as Accounts;
  }

  async chainId() {
    return this.chainIds();
  }
  async chainIds() {
    const chainsInfo = await this.chainsInfo();
    return Object.keys(chainsInfo) as ChainId[];
  }
  async chainsInfo() {
    const chainsInfo: ChainsInfo = {};
    Object.values(await getChainInfoMap())?.forEach(chainInfo => {
      const tmpChainInfo: any = { ...chainInfo };
      tmpChainInfo.lastModifyTime && delete tmpChainInfo.lastModifyTime;
      tmpChainInfo.id && delete tmpChainInfo.id;
      chainsInfo[chainInfo.chainId] = [tmpChainInfo];
    });
    return chainsInfo;
  }
  async getRpcUrl(chainId: ChainId): Promise<string | undefined> {
    return (await this.getChainInfo(chainId))?.endPoint;
  }

  async checkManagerIsExist(props: CheckManagerParams): Promise<boolean | undefined> {
    return await this.getWallet().checkManagerIsExist(props);
  }

  // async getRememberMeBlackList(): Promise<string[] | undefined> {
  //   const [currentNetwork, state] = await Promise.all([this.networkType(), this.getState()]);
  //   return state.cms.rememberMeBlackListMap?.[currentNetwork]?.map(({ url }) => url);
  // }
}
