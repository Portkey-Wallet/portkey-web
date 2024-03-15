import { describe, expect, jest, test } from '@jest/globals';
import ramp, { IRampProviderType, SELL_ORDER_DISPLAY_STATUS } from '../src';
import { rampRequestConfig } from './__mocks__/commonData';
import { rampInfoResponse } from './__mocks__/requestData';
import RampFetchRequestMock, { commonResponse } from './__mocks__/rampRequest';

jest.mock('../src/constants');

jest.mock('../src/service', () => {
  const originalModule = jest.requireActual('../src/service');

  return {
    RampService: jest.fn().mockImplementation(() => {
      return {
        getRampInfo: async () => {
          return commonResponse({ thirdPart: { ...rampInfoResponse.thirdPart, Test: {} } });
        },
        sendSellTransaction: jest.fn(),
      };
    }),
    AlchemyPayRampService: (originalModule as any).AlchemyPayRampService,
  };
});

jest.mock('../src/signalr', () => {
  return {
    RampSignalr: jest.fn().mockImplementation(() => {
      return {
        doOpen: (data: any) => {
          return data;
        },
        invoke: (_name: string, data: any) => {
          return data;
        },
        requestRampOrderStatus: (_name: string, data: any) => {
          return data;
        },
        onRampOrderChanged: (callback: Function) => {
          callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.TRANSFERRED });
          return { remove: jest.fn() };
        },
        stop: jest.fn(),
      };
    }),
  };
});

ramp.fetchRequest = new RampFetchRequestMock({});

describe('ramp instance', () => {
  test('execute init', () => {
    ramp.init({
      requestConfig: rampRequestConfig,
    });
    expect(ramp.config.requestConfig).toEqual(rampRequestConfig);
  });

  test('execute refreshRampProvider', async () => {
    await ramp.refreshRampProvider();
    expect(ramp.providerMap).toHaveProperty('Alchemy');
    expect(ramp.providerMap).toHaveProperty('Transak');
  });

  test('execute getProvider', () => {
    const res = ramp.getProvider(IRampProviderType.AlchemyPay);
    expect(res?.providerInfo.key).toEqual('Alchemy');
  });

  test('execute removeProvider', () => {
    ramp.removeProvider(IRampProviderType.Transak);
    expect(ramp.providerMap).not.toHaveProperty('Transak');
  });

  test('execute transferCrypto', async () => {
    ramp.rampSignalr.onRampOrderChanged = (callback: Function) => {
      callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.TRANSFERRING });

      setTimeout(() => {
        callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.TRANSFERRED });
      }, 500);
      return { remove: jest.fn() };
    };

    ramp.setConfig({
      requestConfig: {
        socketUrl: '',
        baseURL: 'https://xxx.com',
      },
    });

    const res = await ramp.transferCrypto('123abc', () => {
      return Promise.resolve({ rawTransaction: 'rawTransaction', signature: 'signature', publicKey: 'publicKey' });
    });
    expect(res).toHaveProperty('displayStatus');
    expect(res.displayStatus).toBe(SELL_ORDER_DISPLAY_STATUS.TRANSFERRED);
  });

  test('execute transferCrypto, and transferCrypto callback error.', async () => {
    ramp.rampSignalr.onRampOrderChanged = (callback: Function) => {
      callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.CREATED });

      setTimeout(() => {
        callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.TRANSFERRED });
      }, 500);
      return { remove: jest.fn() };
    };

    try {
      ramp.setConfig({
        requestConfig: {
          socketUrl: 'https://xxx-socket.io',
        },
      });

      await ramp.transferCrypto('123abc', async () => {
        throw 'error';
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Transaction failed.');
    }
  });

  test('timeout', async () => {
    ramp.rampSignalr.onRampOrderChanged = (callback: Function) => {
      callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.CREATED });
      return { remove: jest.fn() };
    };

    try {
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');

      await ramp.transferCrypto('123abc', async () => {
        jest.runAllTimers();
        return { rawTransaction: 'rawTransaction', signature: 'signature', publicKey: 'publicKey' };
      });
    } catch (error) {
      expect(error.code).toBe('TIMEOUT');
    }
  });

  test('catch rampSignalr.doOpen error', async () => {
    ramp.rampSignalr.doOpen = () => {
      throw 'doOpen error';
    };
    ramp.rampSignalr.onRampOrderChanged = (callback: Function) => {
      callback({ displayStatus: SELL_ORDER_DISPLAY_STATUS.TRANSFERRED });
      return { remove: jest.fn() };
    };
    ramp.setConfig({
      requestConfig: {
        socketUrl: '',
        baseURL: '',
      },
    });

    try {
      await ramp.transferCrypto('123abc', async () => {
        return Promise.resolve({ rawTransaction: 'rawTransaction', signature: 'signature', publicKey: 'publicKey' });
      });
    } catch (error) {
      console.log('error', error);
    }
  });
});
