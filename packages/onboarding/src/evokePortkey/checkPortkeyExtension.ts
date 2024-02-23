import { detectBrowserName } from '../utils';
import { EXTENSION_DOWNLOAD_URL, EXTENSION_V2_DOWNLOAD_URL } from '../constants';
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
  const version = params?.version;
  const downloadUrl = version !== 'v1' ? EXTENSION_V2_DOWNLOAD_URL : EXTENSION_DOWNLOAD_URL;

  const browserName = detectBrowserName();
  const downloadURL = downloadUrl[browserName] || downloadUrl.DEFAULT;

  _window.open(downloadURL, openTarget);
  return false;
};

export default checkPortkeyExtension;
