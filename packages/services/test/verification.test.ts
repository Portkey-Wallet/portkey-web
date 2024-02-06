import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Verification } from '../src/service/verification';

// jest.mock('./request');

const request = new FetchRequestMock({});
const verification = new Verification(request);

describe('verification describe', () => {
  test('test getVerificationCode', async () => {
    const result = await verification.getVerificationCode({
      params: {
        chainId: 'AELF',
        type: 'Email',
        verifierId: 'verifierId_mock',
        guardianIdentifier: 'guardianIdentifier_mock',
        operationType: 0,
      },
      headers: {
        reCaptchaToken: 'xxxx',
      },
    });
    expect(result).toHaveProperty('verifierSessionId');
  });

  test('test verifyVerificationCode', async () => {
    const result = await verification.verifyVerificationCode({
      verifierSessionId: 'verifierSessionId_mock',
      verificationCode: 'verificationCode_mock',
      guardianIdentifier: 'guardianIdentifier_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test sendAppleUserExtraInfo', async () => {
    const result = await verification.sendAppleUserExtraInfo({
      identityToken: 'identityToken_mock',
      userInfo: {
        name: {
          firstName: 'firstName_mock',
          lastName: 'lastName_mock',
        },
        email: 'email_mock',
      },
    });
    expect(result).toHaveProperty('userId');
  });

  test('test getAppleUserExtraInfo', async () => {
    const result = await verification.getAppleUserExtraInfo({
      userId: 'string',
    });
    expect(result).toHaveProperty('userId');
  });

  test('test verifyGoogleToken', async () => {
    const result = await verification.verifyGoogleToken({
      accessToken: 'accessToken_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test verifyAppleToken', async () => {
    const result = await verification.verifyAppleToken({
      identityToken: 'identityToken_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test verifyTelegramToken', async () => {
    const result = await verification.verifyTelegramToken({
      accessToken: 'accessToken_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test checkGoogleRecaptcha', async () => {
    const result = await verification.checkGoogleRecaptcha({
      operationType: 0,
    });
    expect(typeof result).toEqual('boolean');
  });

  test('test getRecommendationVerifier', async () => {
    const result = await verification.getRecommendationVerifier({ chainId: 'AELF' });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('imageUrl');
  });
});
