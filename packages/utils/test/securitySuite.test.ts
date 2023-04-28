import { describe, expect, test } from '@jest/globals';
import { SecuritySuite } from '../src/securitySuite';

const securitySuite = new SecuritySuite();

describe('describe securitySuite', () => {
  test('test SecuritySuite', () => {
    const result = securitySuite.passwordStrengthCheck('123');
    expect(result).toBeTruthy();

    const result2 = securitySuite.passwordStrengthCheck('test');
    expect(result2).not.toBeTruthy();
  });
});
