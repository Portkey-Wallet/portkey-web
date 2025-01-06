import isUrl from 'is-url';

/**
 * check if url is ip
 * @param url
 * @returns
 */
export const isDangerousLink = (url: string): boolean => {
  return /^(?:http:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!&',;=.+]+$/g.test(url);
};

/**
 * Returns URL prefixed with protocol
 *
 * @param url - String corresponding to url
 * @param defaultProtocol - Protocol string to append to URLs that have none
 * @returns - String corresponding to sanitized input depending if it's a search or url
 */
export const prefixUrlWithProtocol = (url: string, defaultProtocol = 'https://') => {
  const hasProtocol = /^[a-zA-Z]*:\/\//.test(url);
  const sanitizedURL = hasProtocol ? url : `${defaultProtocol}${url}`;
  return sanitizedURL;
};

/**
 * Return an URL object from url string
 *
 * @param url - String containing url
 * @returns - URL object
 */
export function getUrlObj(url: string) {
  return new URL(url);
}

/**
 * Return host from url string
 *
 * @param url - String containing url
 * @param defaultProtocol
 * @returns - String corresponding to host
 */
export function getHost(url: string, defaultProtocol = 'https://') {
  const isValidUrl = isUrl(url);
  if (!isValidUrl) return url;

  const sanitizedUrl = prefixUrlWithProtocol(url, defaultProtocol);
  const { hostname } = getUrlObj(sanitizedUrl);

  const result = hostname === '' ? url : hostname;

  return result;
}

/**
 * getFaviconUrl
 * @param url
 * @param size
 * @returns string
 */
export function getFaviconUrl(url: string, size: number = 50): string {
  return `https://icon.horse/icon/${getHost(url)}/${size}`;
}

/**
 * Returns URL prefixed with protocol, which could be a search engine url if
 * a keyword is detected instead of a url
 *
 * @param input - String corresponding to url input
 * @param defaultProtocol - Protocol string to append to URLs that have none
 * @returns - String corresponding to sanitized input depending if it's a search or url
 */
export default function getFullUrl(input: string, defaultProtocol = 'https://') {
  //Check if it's a url or a keyword
  return prefixUrlWithProtocol(input, defaultProtocol);
}
