import { IBaseRequest, RequestOpts, IRequestDefaults } from '@portkey/types';
import { fetchFormat, timeoutPromise } from './utils';

const DEFAULT_FETCH_TIMEOUT = 8000;

export class FetchRequest implements IBaseRequest {
  protected _defaults: IRequestDefaults;
  constructor(defaults: IRequestDefaults) {
    this._defaults = defaults;
  }
  async send(config: RequestOpts): Promise<any> {
    const { headers, baseURL, url, method, timeout = DEFAULT_FETCH_TIMEOUT } = this._defaults || {};

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
    return result as any;
  }
}
