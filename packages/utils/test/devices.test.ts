import { describe, expect, test } from '@jest/globals';
import { isMobile, isMobileDevices } from '../src/devices';

const userAgent =
  'Mozilla/5.0 (Linux; Android 9; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.89 Mobile Safari/537.36';
const navigator = {
  userAgent,
  platform: 'Linux armv8l',
};

describe('aes describe', () => {
  test('isMobile', () => {
    const result = isMobile(userAgent);
    expect(result.apple.phone).toBe(false);
    expect(result.apple.ipod).toBe(false);
    expect(result.apple.tablet).toBe(false);
    expect(result.apple.universal).toBe(false);
    expect(result.apple.device).toBe(false);
    expect(result.amazon.phone).toBe(false);
    expect(result.amazon.tablet).toBe(false);
    expect(result.amazon.device).toBe(false);
    expect(result.android.phone).toBe(true);
    expect(result.android.tablet).toBe(false);
    expect(result.android.device).toBe(true);
    expect(result.windows.phone).toBe(false);
    expect(result.windows.tablet).toBe(false);
    expect(result.windows.device).toBe(false);
    expect(result.other.blackberry).toBe(false);
    expect(result.other.blackberry10).toBe(false);
    expect(result.other.opera).toBe(false);
    expect(result.other.firefox).toBe(false);
    expect(result.other.chrome).toBe(true);
    expect(result.other.device).toBe(true);
    expect(result.any).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.tablet).toBe(false);

    const result2 = isMobile(navigator);
    expect(result2.apple.phone).toBe(false);
    expect(result2.apple.ipod).toBe(false);
    expect(result2.apple.tablet).toBe(false);
    expect(result2.apple.universal).toBe(false);
    expect(result2.apple.device).toBe(false);
    expect(result2.amazon.phone).toBe(false);
    expect(result2.amazon.tablet).toBe(false);
    expect(result2.amazon.device).toBe(false);
    expect(result2.android.phone).toBe(true);
    expect(result2.android.tablet).toBe(false);
    expect(result2.android.device).toBe(true);
    expect(result2.windows.phone).toBe(false);
    expect(result2.windows.tablet).toBe(false);
    expect(result2.windows.device).toBe(false);
    expect(result2.other.blackberry).toBe(false);
    expect(result2.other.blackberry10).toBe(false);
    expect(result2.other.opera).toBe(false);
    expect(result2.other.firefox).toBe(false);
    expect(result2.other.chrome).toBe(true);
    expect(result2.other.device).toBe(true);
    expect(result2.any).toBe(true);
    expect(result2.phone).toBe(true);
    expect(result2.tablet).toBe(false);
  });

  test('test isMobileDevices', () => {
    global.navigator = {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
      platform: 'MacIntel',
    } as any;
    const result = isMobileDevices();
    expect(result).toBe(false);
  });

  test('test Facebook', () => {
    const result = isMobile(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone13,3;FBMD/iPhone;FBSN/iOS;FBSV/14.0;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]',
    );

    expect(result.apple.phone).toBe(true);
    expect(result.apple.ipod).toBe(false);
    expect(result.apple.tablet).toBe(false);
    expect(result.apple.universal).toBe(false);
    expect(result.apple.device).toBe(true);
    expect(result.amazon.phone).toBe(false);
    expect(result.amazon.tablet).toBe(false);
    expect(result.amazon.device).toBe(false);
    expect(result.android.phone).toBe(false);
    expect(result.android.tablet).toBe(false);
    expect(result.android.device).toBe(false);
    expect(result.windows.phone).toBe(false);
    expect(result.windows.tablet).toBe(false);
    expect(result.windows.device).toBe(false);
    expect(result.other.blackberry).toBe(false);
    expect(result.other.blackberry10).toBe(false);
    expect(result.other.opera).toBe(false);
    expect(result.other.firefox).toBe(false);
    expect(result.other.chrome).toBe(false);
    expect(result.other.device).toBe(false);
    expect(result.any).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.tablet).toBe(false);
  });

  test('test Twitter', () => {
    const result = isMobile(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Twitter/7.52.1',
    );

    expect(result.apple.phone).toBe(true);
    expect(result.apple.ipod).toBe(false);
    expect(result.apple.tablet).toBe(false);
    expect(result.apple.universal).toBe(false);
    expect(result.apple.device).toBe(true);
    expect(result.amazon.phone).toBe(false);
    expect(result.amazon.tablet).toBe(false);
    expect(result.amazon.device).toBe(false);
    expect(result.android.phone).toBe(false);
    expect(result.android.tablet).toBe(false);
    expect(result.android.device).toBe(false);
    expect(result.windows.phone).toBe(false);
    expect(result.windows.tablet).toBe(false);
    expect(result.windows.device).toBe(false);
    expect(result.other.blackberry).toBe(false);
    expect(result.other.blackberry10).toBe(false);
    expect(result.other.opera).toBe(false);
    expect(result.other.firefox).toBe(false);
    expect(result.other.chrome).toBe(false);
    expect(result.other.device).toBe(false);
    expect(result.any).toBe(true);
    expect(result.phone).toBe(true);
    expect(result.tablet).toBe(false);
  });

  test('test apple tablet', () => {
    const result = isMobile({
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      platform: 'MacIntel',
    });
    expect(result.apple.tablet).toBe(true);
  });
});
