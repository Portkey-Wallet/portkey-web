import { beforeEach, describe, expect, vi, test } from 'vitest';
import { RampConfig } from '../../src/config';
import { rampRequestConfig } from '../__mocks__/commonData';

const rampConfig = new RampConfig();

describe('RampConfig', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  test('rampConfig has all properties.', () => {
    expect(rampConfig).toHaveProperty('requestConfig');
    expect(rampConfig).toHaveProperty('setConfig');
  });
  test('execute setConfig, and set empty data.', () => {
    rampConfig.setConfig({
      requestConfig: undefined as unknown as any,
    });

    expect(rampConfig.requestConfig).toEqual({});
  });
  test('execute setConfig, and set data correctly.', () => {
    rampConfig.setConfig({
      requestConfig: rampRequestConfig,
    });

    expect(rampConfig.requestConfig).toEqual(rampRequestConfig);
  });
  test('new RampConfig with options, and set data correctly.', () => {
    const rampConfigWithOptions = new RampConfig({ requestConfig: rampRequestConfig });

    expect(rampConfigWithOptions.requestConfig).toEqual(rampRequestConfig);
  });
});
