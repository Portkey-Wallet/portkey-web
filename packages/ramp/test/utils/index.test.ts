import { describe, expect, test } from 'vitest';
import { validateError } from '../../src/utils';

describe('validateError', () => {
  test('success is false and code is 20000, throw error.', () => {
    try {
      validateError('failed', false, '20000');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
  test('success is true and code is 50000, throw error.', () => {
    try {
      validateError('failed', true, '50000');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
