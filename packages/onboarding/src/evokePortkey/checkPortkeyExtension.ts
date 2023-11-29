import { detectBrowserName } from '../utils';
import { EXTENSION_DOWNLOAD_URL } from '../constants';
import { IEvokeExtensionProps } from './types';
import detectProvider from '@portkey/detect-provider';

/**
 * This method is used to check if the provided object is a Portkey provider.
 */
async function isPortkeyProvider(): Promise<boolean> {
  try {
    const provider = await detectProvider();
    return !!provider;
  } catch (error) {
    return false;
  }
}

const checkPortkeyExtension = async (params?: IEvokeExtensionProps) => {
  const openTarget = params?.openTarget;
  if (typeof window === 'undefined') return false;
  const _window: any = window;

  if (await isPortkeyProvider()) return true;

  const browserName = detectBrowserName();
  const downloadURL = EXTENSION_DOWNLOAD_URL[browserName] || EXTENSION_DOWNLOAD_URL.DEFAULT;

  _window.open(downloadURL, openTarget);
  return false;
};

export default checkPortkeyExtension;
