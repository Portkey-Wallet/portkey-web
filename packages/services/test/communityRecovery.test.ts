import 'isomorphic-fetch';
import { describe, expect, test, jest } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { CommunityRecovery } from '../src/service/communityRecovery';
import DIDGraphQLMock from './__mocks__/didGraphQL';
import { IReferralConfig } from '@portkey/types';

const request = new FetchRequestMock({});
const didGraphQL = new DIDGraphQLMock({
  client: {} as any,
});
const referral: IReferralConfig = {
  referralInfo: {
    referralCode: '1000',
    projectCode: '2000',
  },
  setReferralInfo: jest.fn(),
  getReferralInfo: jest.fn(),
};
const communityRecovery = new CommunityRecovery(request, didGraphQL, referral);

describe('communityRecovery describe', () => {
  test('test getHolderInfo', async () => {
    const result = await communityRecovery.getHolderInfo({
      chainId: 'AELF',
      caHash: 'caHash_mock',
    });
    expect(result).toHaveProperty('caAddress');
    expect(result).toHaveProperty('caHash');
    expect(result).toHaveProperty('guardianList');
    expect(result.guardianList.guardians[0]).toHaveProperty('guardianIdentifier');
    expect(result.guardianList.guardians[0]).toHaveProperty('identifierHash');
    expect(result.guardianList.guardians[0]).toHaveProperty('isLoginGuardian');
    expect(result.guardianList.guardians[0]).toHaveProperty('salt');
    expect(result.guardianList.guardians[0]).toHaveProperty('type');
    expect(result.guardianList.guardians[0]).toHaveProperty('verifierId');
    expect(result).toHaveProperty('managerInfos');
    expect(result.managerInfos[0]).toHaveProperty('address');
    expect(result.managerInfos[0]).toHaveProperty('extraData');
  });

  test('test getRegisterInfo', async () => {
    const result = await communityRecovery.getRegisterInfo({});
    expect(result).toHaveProperty('originChainId');
  });

  test('test getVerificationCode', async () => {
    const result = await communityRecovery.getVerificationCode({
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
    const result = await communityRecovery.verifyVerificationCode({
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

  test('test register', async () => {
    const result = await communityRecovery.register({
      type: 'Email',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      manager: 'manager_mock',
      extraData: 'extraData_mock',
      chainId: 'AELF',
      verifierId: 'verifierId_mock',
      verificationDoc: 'verificationDoc_mock',
      signature: 'signature_mock',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    expect(result).toHaveProperty('sessionId');
  });

  test('test recovery', async () => {
    const result = await communityRecovery.recovery({
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      manager: 'manager_mock',
      guardiansApproved: [],
      extraData: 'extraData_mock',
      chainId: 'AELF',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    expect(result).toHaveProperty('sessionId');
  });

  test('test getHolderInfoByManager', async () => {
    const caHolderManagerInfo = await communityRecovery.getHolderInfoByManager({
      manager: 'manager_mock',
      chainId: 'AELF',
    });

    expect(caHolderManagerInfo.length).toBeGreaterThan(0);
    expect(caHolderManagerInfo[0]).toHaveProperty('caAddress');
    expect(caHolderManagerInfo[0]).toHaveProperty('managerInfos');
    expect(caHolderManagerInfo[0].managerInfos?.length).toBeGreaterThan(0);
    expect(caHolderManagerInfo[0]).toHaveProperty('loginGuardianInfo');
    expect(caHolderManagerInfo[0].loginGuardianInfo.length).toBeGreaterThan(0);
  });

  test('test sendAppleUserExtraInfo', async () => {
    const result = await communityRecovery.sendAppleUserExtraInfo({
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

  test('test verifyGoogleToken', async () => {
    const result = await communityRecovery.verifyGoogleToken({
      accessToken: 'accessToken_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test getAppleUserExtraInfo', async () => {
    const result = await communityRecovery.getAppleUserExtraInfo({ userId: 'string' });
    expect(result).toHaveProperty('userId');
    expect(result.userId).toEqual('userId_mock');
  });

  test('test verifyTelegramToken', async () => {
    const result = await communityRecovery.verifyTelegramToken({
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
    const result = await communityRecovery.verifyAppleToken({
      identityToken: 'identityToken_mock',
      verifierId: 'verifierId_mock',
      chainId: 'AELF',
      operationType: 0,
      operationDetails: '{}',
    });
    expect(result).toHaveProperty('verificationDoc');
    expect(result).toHaveProperty('signature');
  });

  test('test checkGoogleRecaptcha', async () => {
    const result = await communityRecovery.checkGoogleRecaptcha({
      operationType: 0,
    });
    expect(typeof result).toEqual('boolean');
  });

  test('test getPhoneCountryCodeWithLocal', async () => {
    const result = await communityRecovery.getPhoneCountryCodeWithLocal();
    expect(Array.isArray(result.data)).toBeTruthy();
    expect(result.locateData).toHaveProperty('country');
    expect(result.locateData).toHaveProperty('code');
    expect(result.locateData).toHaveProperty('iso');
  });

  test('test getRecommendationVerifier', async () => {
    const result = await communityRecovery.getRecommendationVerifier({ chainId: 'AELF' });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('imageUrl');
  });
});
