import { sleep } from '@portkey/utils';
import { detectBrowserName } from '../utils';
import { EXTENSION_DOWNLOAD_URL } from '../constants';

export const checkPortkeyExtension = async () => {
  if (typeof window === 'undefined') return false;
  const _window: any = window;

  if (_window.portkey) return true;
  await sleep(1000);
  if (_window.portkey) return true;
  const browserName = detectBrowserName();
  const downloadURL = EXTENSION_DOWNLOAD_URL[browserName] || EXTENSION_DOWNLOAD_URL.DEFAULT;

  _window.open(downloadURL, '_blank');
  return false;
};
