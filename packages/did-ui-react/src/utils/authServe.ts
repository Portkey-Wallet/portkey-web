import { RefreshTokenConfig } from '@portkey/services';
import { did, isValidRefreshTokenConfig, queryAuthorization } from './did';
import { ChainId, RequestOpts } from '@portkey/types';
import { fetchFormat, timeoutPromise } from '@portkey/request';
import ramp from '@portkey/ramp';
import { apiVersion } from '../components/config-provider/LocalConfig';
import { getSocketUrl } from '../components/config-provider/utils';
const DEFAULT_FETCH_TIMEOUT = 8000;

interface IAuthTokenServe {
  addRequestAuthCheck(originChainId: ChainId): void;
  setRefreshTokenConfig(originChainId: ChainId): void;
  getConnectToken({ originChainId }: { originChainId: ChainId }): Promise<string>;
}

export class AuthServeInit implements IAuthTokenServe {
  protected refreshTokenConfig?: RefreshTokenConfig;
  protected originChainId?: ChainId;

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
      ramp.init({
        requestConfig: {
          socketUrl: getSocketUrl(),
          headers: {
            Version: apiVersion,
            'Client-Type': 'ThirdParty',
            Authorization: token,
          },
        },
      });
      return token;
    } catch (error) {
      return;
    }
  };

  addRequestAuthCheck = (originChainId: ChainId) => {
    if (!(did.fetchRequest as any)?.isSet || this.originChainId !== originChainId) {
      this.originChainId = originChainId;
      const send = async (config: RequestOpts) => {
        return this.sendOrigin(config, originChainId, 0);
      };
      did.fetchRequest.send = send;
      (did.fetchRequest as any).isSet = true;
    }
    return did;
  };

  private sendOrigin = async (config: RequestOpts, originChainId: ChainId, reCount: number): Promise<any> => {
    try {
      return await this.request(config);
    } catch (error: any) {
      if (typeof error === 'object' && error.status === 401 && error.message?.toLocaleLowerCase() === 'unauthorized') {
        if (reCount > 5) throw error;
        const token = await this.setRefreshTokenConfig(originChainId);
        if (!token) {
          if (this.refreshTokenConfig && !isValidRefreshTokenConfig(this.refreshTokenConfig)) {
            // TODO: definite message
            throw { ...error, code: 402, message: 'token expires' };
          }
          throw error;
        }

        return this.sendOrigin(config, originChainId, ++reCount);
      }
      throw error;
    }
  };

  private request = async (config: RequestOpts) => {
    const { headers, baseURL, url, method, timeout = DEFAULT_FETCH_TIMEOUT } = did.config.requestConfig || {};

    const _config = { ...config };
    _config.headers = { ...headers, ..._config.headers };
    _config.method = _config.method || method;
    _config.url = _config.url || url;
    if (baseURL) _config.url = baseURL + _config.url;

    const control = new AbortController();

    const result = await Promise.race([fetchFormat(_config, control.signal), timeoutPromise(timeout)]);
    if (result?.type === 'timeout') {
      if (control.abort) control.abort();
      throw new Error('fetch timeout');
    }
    return result;
  };
}

export const AuthServe = new AuthServeInit();
