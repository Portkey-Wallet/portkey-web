import queryString from 'query-string';
import { EvokeAppConfig, EvokeAppOptions, Intent } from './types';

// Generate basic url scheme
export function buildScheme(config: EvokeAppConfig, options: EvokeAppOptions): string {
  const { path, param } = config;
  const { scheme, buildScheme: customBuildScheme } = options;

  if (typeof customBuildScheme !== 'undefined') {
    return customBuildScheme(config, options);
  }

  const { domain, protocol } = scheme;

  return queryString.stringifyUrl(
    {
      url: `${protocol}://${domain}/${path}`,
      query: param,
    },
    { encode: true },
  );
}

// Generate the url scheme required by the business (distinguish whether it is an external link)
export function generateScheme(config: EvokeAppConfig, options: EvokeAppOptions): string {
  const { outChain } = options;
  let uri = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { protocol, path, key } = outChain;
    uri = `${protocol}://${path}?${key}=${encodeURIComponent(uri)}`;
  }

  return uri;
}

// generate android intent
export function generateIntent(config: EvokeAppConfig, options: EvokeAppOptions): string {
  const { outChain } = options;
  const { intent, fallback } = options;
  if (typeof intent === 'undefined') return '';

  const keys = Object.keys(intent) as Array<keyof Intent>;
  const intentParam = keys.map(key => `${key}=${intent[key]};`).join('');
  const intentTail = `#Intent;${intentParam}S.browser_fallback_url=${encodeURIComponent(fallback || '')};end;`;
  let urlPath = buildScheme(config, options);

  if (typeof outChain !== 'undefined' && outChain) {
    const { path, key } = outChain;
    return `intent://${path}?${key}=${encodeURIComponent(urlPath)}${intentTail}`;
  }

  urlPath = urlPath.slice(urlPath.indexOf('//') + 2);

  return `intent://${urlPath}${intentTail}`;
}

// generate universalLink
export function generateUniversalLink(config: EvokeAppConfig, options: EvokeAppOptions): string {
  const { universal } = options;
  if (typeof universal === 'undefined') return '';

  const { domain, pathKey } = universal;
  const { path, param } = config;

  const protocol = 'https';

  const newUniversalLink = stringifyUrl(
    {
      url: `${protocol}://${domain}/${path}`,
      query: param,
    },
    { encode: true },
  );

  const oldUniversalLink = stringifyUrl(
    {
      url: `${protocol}://${domain}/${path}`,
      query: pathKey ? { [pathKey]: path, ...param } : param,
    },
    { encode: true },
  );

  return pathKey ? oldUniversalLink : newUniversalLink;
}
