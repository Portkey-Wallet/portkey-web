import { RefreshTokenConfig } from '@portkey/services';
import { did, isValidRefreshTokenConfig, queryAuthorization } from './did';
import { ChainId } from '@portkey/types';

interface IAuthTokenServe {
  addRequestAuthCheck<T>(funObj: T, originChainId: ChainId): void;
  setRefreshTokenConfig(originChainId: ChainId): void;
  getConnectToken({ originChainId }: { originChainId: ChainId }): Promise<string>;
}

export class AuthServeInit implements IAuthTokenServe {
  protected refreshTokenConfig?: RefreshTokenConfig;

  getConnectToken = ({ originChainId }: { originChainId: ChainId }) => {
    if (!did.didWallet.managementAccount) throw 'ManagementAccount is not exist';
    const caHash = did.didWallet.caInfo[originChainId]['caHash'];
    const managementAccount = did.didWallet.managementAccount;
    const timestamp = Date.now();
    const message = Buffer.from(`${managementAccount.address}-${timestamp}`).toString('hex');
    const signature = managementAccount.sign(message).toString('hex');
    const pubkey = managementAccount.wallet.keyPair.getPublic('hex');
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
    this.refreshTokenConfig = config;
    return queryAuthorization(config);
  };

  setRefreshTokenConfig = async (originChainId: ChainId) => {
    const requestDefaults = did.config.requestDefaults ? did.config.requestDefaults : {};
    try {
      const token = await this.getConnectToken({ originChainId });
      if (!requestDefaults.headers) requestDefaults.headers = {};
      requestDefaults.headers = {
        ...requestDefaults?.headers,
        Authorization: token,
      };
      did.setConfig({ requestDefaults });
    } catch (error) {
      console.log(error);
    }
  };

  addRequestAuthCheck = (funObj: any, originChainId: ChainId) => {
    if (typeof funObj !== 'object') throw 'Please check Params';

    Reflect.ownKeys(funObj).forEach(async (key) => {
      if (key !== 'constructor' && typeof funObj[key] === 'function') {
        // funObj[key] = ;
        Reflect.set(funObj, key, this.functionWrap(funObj[key], 0, originChainId));
      }
    });
    return funObj;
  };

  private functionWrap = (callback: Function, reCount = 0, originChainId: ChainId) => {
    return this.sendOrigin(callback, reCount, originChainId);
  };

  private sendOrigin = (callback: Function, reCount: number, originChainId: ChainId) => {
    console.log('sendOrigin=fetchResult', originChainId, 'fetchResult==originChainId');

    return async (...props: any) => {
      const fetchResult = await callback(props);
      if (fetchResult && fetchResult.status === 401 && fetchResult.message === 'unauthorized') {
        if (reCount > 5) throw fetchResult;
        const token = await this.getConnectToken({ originChainId });
        console.log(token, 'fetchResult==token');
        if (!token) {
          if (this.refreshTokenConfig && !isValidRefreshTokenConfig(this.refreshTokenConfig)) {
            // TODO: definite message
            throw { ...fetchResult, code: 402, message: 'token expires' };
          }
          throw fetchResult;
        }
        return this.functionWrap(callback, ++reCount, originChainId);
      }
      return fetchResult;
    };
  };
}

export const AuthServe = new AuthServeInit();
