import 'isomorphic-fetch';
import { describe, expect, test, jest } from '@jest/globals';
import AElf from 'aelf-sdk';

import { portkey } from '@portkey/accounts';
import { StorageMock } from './__mocks__/storageMock';

import { CommunityRecovery } from '@portkey/services';

import { getGraphQLClientProvider } from '@portkey/graphql';
import FetchRequestMock from '@portkey/services/test/__mocks__/request';
import ContractBasicMock from './__mocks__/contractBasic';
import DIDGraphQLMock from '@portkey/services/test/__mocks__/didGraphQL';
import { IBlockchainWallet } from '@portkey/types';

jest.mock('@portkey/contracts', () => {
  return {
    ContractBasic: ContractBasicMock,
    getContractBasic: ({
      contractAddress,
      rpcUrl,
    }: {
      rpcUrl?: string;
      contractAddress: string;
      aelfInstance?: any;
      account: { address: string } | IBlockchainWallet;
    }) => {
      return new ContractBasicMock({
        contractAddress: contractAddress || 'contractAddress_mock',
        rpcUrl: rpcUrl || 'rpcUrl_mock',
      });
    },
  };
});

import { DIDWallet } from '../src/wallet';

const defaultPassword = '123123';

const accountProvider = new portkey.AccountProvider();
const storage = new StorageMock('mock1');
const request = new FetchRequestMock({});
const didGraphQL = new DIDGraphQLMock({
  client: getGraphQLClientProvider(''),
});
const service = new CommunityRecovery(request, didGraphQL);

const privateKey = '03bd0cea9730bcfc8045248fd7f4841ea19315995c44801a3dfede0ca872f808';
const wallet = new DIDWallet({ accountProvider, storage, service });

describe('DIDWallet describe', () => {
  test('test create', () => {
    wallet.create();
    expect(wallet.managementAccount).not.toBeUndefined();
    expect(wallet.managementAccount).not.toBeNull();
    expect(wallet.managementAccount).toHaveProperty('address');
    expect(wallet.managementAccount).toHaveProperty('privateKey');
  });
  test('test getContract', async () => {
    const result = await wallet.getContract({
      contractAddress: 'contractAddress_mock',
      rpcUrl: 'rpcUrl_mock',
    });

    expect(result).toHaveProperty('callSendMethod');
    expect(result).toHaveProperty('callViewMethod');
  });

  test('test login', async () => {
    const result = await wallet.login('loginAccount', {
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      guardiansApproved: [],
      extraData: 'extraData_mock',
      chainId: 'AELF',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('error');

    const scanResult = await wallet.login('scan', {
      chainId: 'AELF',
      caHash: 'caHash_mock',
    });
    expect(scanResult).toBe(true);
  });

  test('test getHolderInfo', async () => {
    const resultByManager = await wallet.getHolderInfo({
      manager: wallet.managementAccount?.address,
      chainId: 'AELF',
    });
    expect(resultByManager.length).toBeGreaterThan(0);

    const result = await wallet.getHolderInfo({
      caHash: 'caHash_mock',
      chainId: 'AELF',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
    });
    expect(result).toHaveProperty('caAddress');
  });

  test('test getLoginStatus', async () => {
    if (wallet.managementAccount) {
      wallet.managementAccount.address = 'address_mock';
    }
    const result = await wallet.getLoginStatus({
      chainId: 'tDVV',
      sessionId: 'sessionId_mock',
    });
    expect(result).toHaveProperty('recoveryStatus');
    expect(result).toHaveProperty('recoveryMessage');
  });

  test('test register', async () => {
    if (wallet.accountInfo) {
      wallet.accountInfo.loginAccount = undefined;
    }
    if (wallet.managementAccount) {
      wallet.managementAccount.address = 'address_mock';
    }
    const result = await wallet.register({
      type: 'Email',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
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
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('error');
  });

  test('test getRegisterStatus', async () => {
    const result = await wallet.getRegisterStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result).toHaveProperty('caAddress');
    expect(result).toHaveProperty('registerStatus');
  });

  test('test getVerifierServers', async () => {
    const result = await wallet.getVerifierServers('AELF');
    expect(result.length).toBeGreaterThan(0);
  });

  test('test getContractByChainInfo', async () => {
    const result = await wallet.getContractByChainInfo('AELF');
    expect(result).toHaveProperty('callSendMethod');
  });

  test('addManager', async () => {
    const result = await wallet.addManager({
      caHash: 'caHash_mock',
      chainId: 'AELF',
    });
    expect(result).toBeTruthy();
  });

  test('test removeManager', async () => {
    const result = await wallet.removeManager({
      caHash: 'caHash_mock',
      chainId: 'AELF',
      managerInfo: {
        address: wallet.managementAccount?.address || '',
        extraData: 'extraData_mock',
      },
    });
    expect(result).toBeTruthy();
    expect(Object.keys(wallet.caInfo)).toHaveLength(0);
    expect(Object.keys(wallet.accountInfo)).toHaveLength(0);
  });

  test('test getHolderInfoByContract', async () => {
    const result = await wallet.getHolderInfoByContract({
      chainId: 'AELF',
    });
    expect(result).toBeTruthy();
  });

  test('test getChainsInfo', async () => {
    const result = await wallet.getChainsInfo();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  test('test logout', async () => {
    await wallet.login('loginAccount', {
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      guardiansApproved: [],
      extraData: 'extraData_mock',
      chainId: 'AELF',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    const result = await wallet.logout({
      chainId: 'AELF',
      caHash: 'caHash_mock',
    });
    expect(result).toBeTruthy();
  });

  test('test signTransaction', async () => {
    const rawTxn = AElf.pbUtils.getTransaction(
      'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
      'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
      'test',
      ['hello', 'world'],
    );
    wallet.managementAccount = accountProvider.privateKeyToAccount(privateKey);
    const result = await wallet.signTransaction(rawTxn);
    expect(result).toHaveProperty('signature');
    expect(result.signature).toBeInstanceOf(Buffer);

    expect(result.signature.toString('hex')).toBe(
      'a3518c1487e019f1de7dca2ea628044f559200a6215c213f7c10cd27e86984d236e056d5b0db6123d6b52e4cb8be5a883c32508f1daef16158907c894154b20b01',
    );
  });

  test('test sign', async () => {
    wallet.managementAccount = accountProvider.privateKeyToAccount(privateKey);
    const result = await wallet.sign('68656c6c6f20776f726c64');
    expect(result.toString('hex')).toBe(
      '276aa36fcab0ac3d4071a4bfb868f636d1a9639916afe4ec329529014f923a372b688b4eb59d6587481bc15e4a1684e1d92b7598967767713d1504dcea83dadb01',
    );
  });

  test('test encrypt', async () => {
    wallet.managementAccount = accountProvider.privateKeyToAccount(privateKey);
    const result = await wallet.encrypt(defaultPassword);
    const unlockWallet = AElf.wallet.keyStore.unlockKeystore(result, defaultPassword);
    expect(unlockWallet.privateKey).toEqual(privateKey);
  });

  test('test save', async () => {
    wallet.managementAccount = accountProvider.privateKeyToAccount(privateKey);
    await wallet.save(defaultPassword, 'test');
    expect(storage.getItem('test')).toBeTruthy();
  });

  test('test load', async () => {
    wallet.managementAccount = accountProvider.privateKeyToAccount(privateKey);
    await wallet.save(defaultPassword, 'test');
    wallet.reset();
    expect(wallet.managementAccount).toBeUndefined();
    await wallet.load(defaultPassword, 'test');
    expect(wallet.managementAccount.privateKey).toEqual(privateKey);
  });

  test('test reset', async () => {
    wallet.reset();
    expect(Object.keys(wallet.contracts)).toHaveLength(0);
    expect(Object.keys(wallet.caInfo)).toHaveLength(0);
    expect(Object.keys(wallet.accountInfo)).toHaveLength(0);
    expect(wallet.managementAccount).toBeUndefined();
  });
});
