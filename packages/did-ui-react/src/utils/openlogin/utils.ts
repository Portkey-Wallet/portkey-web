import { stringify } from 'query-string';

export function getPopupFeatures(): string {
  if (typeof window === 'undefined') return '';
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const w = 1200;
  const h = 700;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : window.screen.width;

  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : window.screen.height;

  const systemZoom = 1; // No reliable estimate

  const left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
  const top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
  const features = `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=${h / systemZoom},width=${
    w / systemZoom
  },top=${top},left=${left}`;
  return features;
}

export function jsonToBase64<T = Record<string, unknown>>(json: T): string {
  const str = JSON.stringify(json);
  return Buffer.from(str).toString('base64');
}

export function base64toJSON<T = Record<string, unknown>>(b64str: string): T {
  const jsonStr = Buffer.from(b64str, 'base64').toString();
  return JSON.parse(jsonStr);
}

export function constructURL(params: { baseURL: string; query?: Record<string, any> }): string {
  const { baseURL, query = {} } = params;
  return `${baseURL}?${stringify(query)}`;
}
