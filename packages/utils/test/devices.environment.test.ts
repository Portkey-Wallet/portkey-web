import { describe, expect, test } from '@jest/globals';
import { getPortkeyShellApp, isPortkeyProvider } from '../src/devices.environment';

declare module MyGlobalThis {
  interface MyGlobal {
    window: {
      portkeyShellApp?: any;
    };
  }
}

const portkeyAppObject = {
  invokeClientMethod: () => {
    //
  },
};

declare const globalThis: MyGlobalThis.MyGlobal;

describe('scheme describe', () => {
  test('test - no portkey shell app', async () => {
    const portkeyShellApp = await getPortkeyShellApp();
    expect(portkeyShellApp).toBeNull();
    globalThis.window = {};
    const portkeyApp1 = await getPortkeyShellApp(500);
    expect(portkeyApp1).toEqual(null);

    globalThis.window = { portkeyShellApp: {} };

    const portkeyApp2 = await getPortkeyShellApp();
    expect(portkeyApp2).toEqual(null);

    globalThis.window = {};

    const ids = setTimeout(() => {
      clearTimeout(ids);
      globalThis.window.portkeyShellApp = portkeyAppObject;
    }, 200);

    const portkeyApp3 = await getPortkeyShellApp(500);
    expect(portkeyApp3).toHaveProperty('invokeClientMethod');

    globalThis.window.portkeyShellApp = portkeyAppObject;

    const portkeyApp4 = await getPortkeyShellApp();
    expect(portkeyApp4).toHaveProperty('invokeClientMethod');
  });

  test('test - isPortkeyProvider', async () => {
    const isProvider = isPortkeyProvider(undefined);

    expect(isProvider).toEqual(false);

    const isProvider1 = isPortkeyProvider({});

    expect(isProvider1).toEqual(false);

    if (!globalThis.window) globalThis.window = {};
    globalThis.window.portkeyShellApp = portkeyAppObject;
    const isProvider2 = isPortkeyProvider(globalThis.window.portkeyShellApp);

    expect(isProvider2).toEqual(true);
  });
});
