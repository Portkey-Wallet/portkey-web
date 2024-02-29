import { describe, expect, test } from '@jest/globals';
import { getPortkeyShellApp, isPortkeyProvider } from '../src/devices.environment';

declare module MyGlobalThis {
  interface MyGlobal {
    window: {
      portkeyAPP?: any;
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
    const portkeyAPP = await getPortkeyShellApp();
    expect(portkeyAPP).toBeNull();
    globalThis.window = {};
    const portkeyApp1 = await getPortkeyShellApp(500);
    expect(portkeyApp1).toEqual(null);

    globalThis.window = { portkeyAPP: {} };

    const portkeyApp2 = await getPortkeyShellApp();
    expect(portkeyApp2).toEqual(null);

    globalThis.window = {};

    const ids = setTimeout(() => {
      clearTimeout(ids);
      globalThis.window.portkeyAPP = portkeyAppObject;
    }, 200);

    const portkeyApp3 = await getPortkeyShellApp(500);
    expect(portkeyApp3).toHaveProperty('invokeClientMethod');

    globalThis.window.portkeyAPP = portkeyAppObject;

    const portkeyApp4 = await getPortkeyShellApp();
    expect(portkeyApp4).toHaveProperty('invokeClientMethod');
  });

  test('test - isPortkeyProvider', async () => {
    const isProvider = isPortkeyProvider(undefined);

    expect(isProvider).toEqual(false);

    const isProvider1 = isPortkeyProvider({});

    expect(isProvider1).toEqual(false);

    if (!globalThis.window) globalThis.window = {};
    globalThis.window.portkeyAPP = portkeyAppObject;
    const isProvider2 = isPortkeyProvider(globalThis.window.portkeyAPP);

    expect(isProvider2).toEqual(true);
  });
});
