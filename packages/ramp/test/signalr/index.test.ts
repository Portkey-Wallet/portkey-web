import { describe, expect, test } from 'vitest';
import { RampSignalr } from '../../src/signalr';

const rampSignalr = new RampSignalr();

describe('RampSignalr', () => {
  test('', async () => {
    rampSignalr.doOpen = (data: any) => {
      return data;
    };

    rampSignalr.invoke = (_name: string, data: any) => {
      return data;
    };

    rampSignalr.listen = (_name: any, callback: (data: { body: any }) => any): any => {
      callback({ body: 'test listen' });
    };

    await rampSignalr.doOpen({
      url: 'https://xxx-socket.io/ca',
      clientId: '123456',
    });

    const requestRampOrderStatusResult = await rampSignalr.requestRampOrderStatus('123456', '123abc');
    expect(requestRampOrderStatusResult).toBeTruthy();
    rampSignalr.onRampOrderChanged(data => {
      expect(data).toBe('test listen');
    });
  });
});
