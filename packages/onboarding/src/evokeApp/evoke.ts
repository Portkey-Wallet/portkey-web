import { Hidden, OpenStatus, VisibilityChange } from './types';

let hidden: Hidden = 'hidden';
let visibilityChange: VisibilityChange = 'visibilitychange';
let iframe: HTMLIFrameElement;

function getSupportedProperty(): void {
  if (typeof document === 'undefined') return;

  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof (document as any).msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof (document as any).webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }
}

getSupportedProperty();

/**
 * Determine whether the page is hidden (enter the background)
 */
function isPageHidden(): boolean {
  if (typeof document === 'undefined') return false;
  if (typeof hidden === 'undefined') return false;
  return document[hidden] as boolean;
}

/**
 * Jump via top.location.href
 * @param {string} [uri] - open
 */
export function evokeByLocation(uri: string): void {
  // if (typeof window === 'undefined') return;
  if (window.top) window.top.location.href = uri;
  else window.location.href = uri;
}

/**
 * Evoked by the A tag
 * @param {string} uri - open url
 */
export function evokeByTagA(uri: string): void {
  const tagA = document.createElement('a');

  tagA.setAttribute('href', uri);
  tagA.style.display = 'none';
  document.body.appendChild(tagA);

  tagA.click();
}

/**
 * Evoked by iframe
 * @param {string} [uri] - open url
 */
export function evokeByIFrame(uri: string): void {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;border:0;width:0;height:0;';
    document.body.appendChild(iframe);
  }

  iframe.src = uri;
}

/**
 * Check whether the calling end is successful
 * @param cb - Callback failure callback function
 * @param timeout
 */
export function checkOpen(callback: (status: OpenStatus) => void, timeout: number): void {
  const timer = setTimeout(() => {
    const pageHidden = isPageHidden();
    if (!pageHidden) {
      callback('failure');
      if (typeof visibilityChange !== 'undefined') {
        document.removeEventListener(visibilityChange, visibilityListenHandler);
      } else {
        window.removeEventListener('pagehide', visibilityListenHandler);
      }
    }
  }, timeout);

  const visibilityListenHandler = () => {
    clearTimeout(timer);
    callback('success');
  };

  if (typeof visibilityChange !== 'undefined') {
    document.addEventListener(visibilityChange, visibilityListenHandler);
  } else {
    window.addEventListener('pagehide', visibilityListenHandler);
  }
}
