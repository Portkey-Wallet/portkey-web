import { describe, expect, test } from 'vitest';
import { handleVerificationDoc } from '../src/did';

describe('did describe', () => {
  test('test handleVerificationDoc', () => {
    const result = handleVerificationDoc(
      'type_mock,guardianIdentifier_mock,verificationTime_mock,verifierAddress_mock,salt_mock',
    );
    expect(result.type).toEqual('type_mock');
    expect(result.guardianIdentifier).toEqual('guardianIdentifier_mock');
    expect(result.verificationTime).toEqual('verificationTime_mock');
    expect(result.verifierAddress).toEqual('verifierAddress_mock');
    expect(result.salt).toEqual('salt_mock');
  });
});
