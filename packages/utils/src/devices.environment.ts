import { ISocialLogin, TCustomNetworkType } from './util.type';

export interface IPortkeyShellClient {
  invokeClientMethod(request: IRequest<ILoginParams>, callback: (args: IResponse<ILoginResponse>) => {}): void;
}

interface IRequest<T> {
  type: string;
  params?: T;
}

interface ILoginParams {
  type: ISocialLogin;
  ctw?: TCustomNetworkType;
  serviceURI?: string;
}

interface IResponse<T> {
  status: number; // success: 1, fail: 0
  msg?: string; // error msg
  code?: number;
  data?: T;
}

interface ILoginResponse {
  token: string;
}

/**
 * This method is used to check if the provided object is a Portkey provider.
 * @param provider - the object that need to be checked
 * @returns provider is IClient
 */
export function isPortkeyProvider<T extends IPortkeyShellClient = IPortkeyShellClient>(
  provider: unknown,
): provider is T {
  return !!(provider && typeof provider === 'object' && 'invokeClientMethod' in provider);
}

export async function getPortkeyShellApp<T extends IPortkeyShellClient = IPortkeyShellClient>(
  timeout?: number,
): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  const _window: any = window;

  if (_window.portkeyShellApp) {
    return isPortkeyProvider<T>(_window.portkeyShellApp) ? _window.portkeyShellApp : null;
  }

  return new Promise(resolve => {
    const handlePortkey = () => {
      clearTimeout(timerId);
      if (isPortkeyProvider<T>(_window.portkeyShellApp)) {
        resolve(_window.portkeyShellApp);
      } else {
        resolve(null);
      }
    };
    const timerId = setTimeout(() => {
      handlePortkey();
    }, timeout);
  });
}
