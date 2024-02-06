import 'isomorphic-fetch';
import { describe, expect, test, jest } from '@jest/globals';

import AElf from 'aelf-sdk';
import { portkey } from '@portkey/accounts';
import { CommunityRecovery, Connect } from '@portkey/services';
import { IBlockchainWallet } from '@portkey/types';

import FetchRequestMock from '@portkey/services/test/__mocks__/request';
import ContractBasicMock from './__mocks__/contractBasic';
import DIDGraphQLMock from '@portkey/services/test/__mocks__/didGraphQL';
import { StorageMock } from './__mocks__/storageMock';

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
        type: 'aelf',
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
  client: {} as any,
});
const service = new CommunityRecovery(request, didGraphQL, {} as any);
const connectService = new Connect(request);

const privateKey = '03bd0cea9730bcfc8045248fd7f4841ea19315995c44801a3dfede0ca872f808';
const wallet = new DIDWallet({ accountProvider, storage, service, connectService });

const getLoggedInWallet = async () => {
  const wallet = new DIDWallet({
    accountProvider,
    storage,
    service,
    connectService,
  });
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
  return wallet;
};

const getWallet = () => new DIDWallet({ accountProvider, storage, service });

describe('DIDWallet describe', () => {
  test('test create', () => {
    wallet.create();
    expect(wallet.managementAccount).not.toBeUndefined();
    expect(wallet.managementAccount).not.toBeNull();
    expect(wallet.managementAccount).toHaveProperty('address');
    expect(wallet.managementAccount).toHaveProperty('privateKey');
  });

  test('test createByPrivateKey', () => {
    const wallet = new DIDWallet({ accountProvider, storage, service, connectService });
    wallet.createByPrivateKey(privateKey);
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

    try {
      await wallet.getContractByChainInfo('tDVV');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    const wallet1 = await getLoggedInWallet();
    wallet1.getChainsInfo = (() => {
      wallet1.chainsInfo = undefined;
    }) as any;
    wallet1.chainsInfo = undefined;
    try {
      await wallet1.getContractByChainInfo('AELF');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getCAHolderInfo', async () => {
    const result = await wallet.getCAHolderInfo('AELF');
    expect(result).toHaveProperty('caAddress');

    const wallet1 = await getLoggedInWallet();

    wallet1.caInfo = {};
    try {
      await wallet1.getCAHolderInfo('AELF');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    wallet1.managementAccount = undefined;
    try {
      await wallet1.getCAHolderInfo('AELF');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    wallet1.connectServices = undefined;
    try {
      await wallet1.getCAHolderInfo('AELF');
    } catch (error) {
      expect(error).toBeTruthy();
    }
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

  test('test logout sendOptions', async () => {
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
    const result = await wallet.logout(
      {
        chainId: 'AELF',
        caHash: 'caHash_mock',
      },
      {
        onMethod: 'transactionHash',
      },
    );
    expect(result).toBeTruthy();
  });

  test('test logout checkResult', async () => {
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
    wallet.removeManager = async () => null;
    const result = await wallet.logout(
      {
        chainId: 'AELF',
        caHash: 'caHash_mock',
      },
      {
        onMethod: 'transactionHash',
      },
    );
    console.log('removeManager', result);
    expect(result.status).toBeUndefined();
    expect(result.transactionId).toBeUndefined();
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

describe('DIDWallet error describe', () => {
  test('test login error', async () => {
    const _service = {
      recovery: () => {
        return {
          sessionId: 'sessionId_mock',
        };
      },
      getRecoverStatus: () => {
        return {
          recoveryStatus: 'pending',
          recoveryMessage: 'recoveryMessage_mock',
        };
      },
    } as any;
    const wallet = new DIDWallet({ accountProvider, storage, service: _service });
    const { error } = await wallet.login('loginAccount', {
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      guardiansApproved: [],
      extraData: 'extraData_mock',
      chainId: 'AELF',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    expect(error).toBeTruthy();
  });

  test('test getLoginStatus error', async () => {
    const wallet = await getLoggedInWallet();
    wallet.getHolderInfo = () => {
      throw new Error('error_mock');
    };

    const result = await wallet.getLoginStatus({ sessionId: 'sessionId_mock', chainId: 'tDVW' });
    expect(result).toBeTruthy();
  });

  test('test getRegisterStatus error', async () => {
    const wallet = await getLoggedInWallet();
    wallet.getHolderInfo = () => {
      throw new Error('error_mock');
    };

    const result = await wallet.getRegisterStatus({ sessionId: 'sessionId_mock', chainId: 'tDVW' });
    expect(result).toBeTruthy();
  });

  test('test register error', async () => {
    const _service = {
      register: () => {
        return {
          sessionId: 'sessionId_mock',
        };
      },
      getRegisterStatus: () => {
        return {
          registerStatus: 'pending',
        };
      },
    } as any;
    const wallet = new DIDWallet({ accountProvider, storage, service: _service });
    const { error } = await wallet.register({
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
    expect(error).toBeTruthy();
  });

  test('test load branch', async () => {
    const wallet = await getLoggedInWallet();
    wallet.caInfo = undefined as any;
    wallet.accountInfo = undefined as any;
    await wallet.save(defaultPassword);
    await wallet.load(defaultPassword);
    expect(Object.keys(wallet.caInfo)).toHaveLength(0);
    expect(Object.keys(wallet.accountInfo)).toHaveLength(0);
  });

  test('test no storage', async () => {
    const wallet = new DIDWallet({ accountProvider, storage: undefined, service });
    try {
      await wallet.save(defaultPassword);
    } catch (error) {
      expect(error).toBeTruthy();
    }
    try {
      await wallet.load(defaultPassword);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test no managementAccount', async () => {
    const wallet = getWallet();
    try {
      await wallet.getContract({} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.addManager({} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.removeManager({} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.logout({} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.signTransaction({});
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      wallet.sign('');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.encrypt('');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    try {
      await wallet.aesEncrypt('');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test logout branch', async () => {
    const wallet = await getLoggedInWallet();

    try {
      await wallet.logout({ chainId: 'tDVV' });
    } catch (error) {
      expect(error).toBeTruthy();
    }

    wallet.removeManager = async () => {
      return {
        error: 'error_mock',
      };
    };

    try {
      await wallet.logout({ chainId: 'AELF' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getHolderInfoByContract branch', async () => {
    const wallet = await getLoggedInWallet();
    wallet.getContractByChainInfo = async () => {
      return {
        callViewMethod: async () => ({
          error: 'error_mock',
        }),
      } as any;
    };
    try {
      await wallet.getHolderInfoByContract({ chainId: 'AELF' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getHolderInfo branch', async () => {
    const serviceMock = {
      getHolderInfo: async () => undefined as any,
      // getHolderInfoByManager: async () => [] as any,
    } as any;

    const wallet = new DIDWallet({
      accountProvider,
      storage,
      service: serviceMock,
    });

    const result = await wallet.getHolderInfo({
      caHash: 'caHash_mock',
      chainId: 'AELF',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
    });
    expect(result).toBeUndefined();

    const wallet2 = getWallet();
    const result2 = await wallet2.getHolderInfo({
      caHash: 'caHash_mock',
      chainId: 'AELF',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
    });
    expect(result2).toBeTruthy();

    wallet2.accountInfo = undefined as any;
    const result3 = await wallet2.getHolderInfo({
      caHash: 'caHash_mock',
      chainId: 'AELF',
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
    });
    expect(result3).toBeTruthy();

    const wallet3 = await getLoggedInWallet();
    wallet3.accountInfo.loginAccount = undefined as any;
    const result4 = await wallet3.getHolderInfo({
      manager: wallet.managementAccount?.address,
      chainId: 'AELF',
    });
    expect(result4).toBeTruthy();

    wallet3.services.getHolderInfoByManager = async () => {
      return [
        {
          caAddress: 'caAddress_mock',
          caHash: 'caHash_mock',
          loginGuardianInfo: [],
        },
      ];
    };
    const result5 = await wallet3.getHolderInfo({
      manager: wallet.managementAccount?.address,
      chainId: 'AELF',
    });
    expect(result5).toBeTruthy();

    wallet3.managementAccount = undefined;
    const result6 = await wallet3.getHolderInfo({
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result6).toBeTruthy();

    try {
      await wallet3.getHolderInfo({
        chainId: 'AELF',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test removeManager branch', async () => {
    const wallet = await getLoggedInWallet();
    const result = await wallet.removeManager({
      caHash: 'caHash_mock',
      chainId: 'AELF',
    });
    expect(result).toBeTruthy();

    wallet.getContractByChainInfo = () =>
      ({
        callSendMethod: () => ({
          error: 'error_mock',
        }),
      } as any);

    try {
      await wallet.removeManager({
        caHash: 'caHash_mock',
        chainId: 'AELF',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test addManager branch', async () => {
    const wallet = await getLoggedInWallet();
    wallet.getContractByChainInfo = () =>
      ({
        callSendMethod: () => ({
          error: 'error_mock',
        }),
      } as any);
    try {
      await wallet.addManager({
        caHash: 'caHash_mock',
        chainId: 'AELF',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getVerifierServers branch', async () => {
    const wallet = getWallet();
    wallet.getContractByChainInfo = () =>
      ({
        callViewMethod: () => ({
          data: undefined,
        }),
      } as any);
    const result = await wallet.getVerifierServers('AELF');
    expect(result).toBeUndefined();

    wallet.getContractByChainInfo = () =>
      ({
        callViewMethod: () => ({
          error: 'error_mock',
        }),
      } as any);
    try {
      await wallet.getVerifierServers('AELF');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getRegisterStatus branch', async () => {
    const wallet = await getLoggedInWallet();
    wallet.caInfo = undefined as any;
    const result = await wallet.getRegisterStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result).toBeTruthy();

    wallet.managementAccount = undefined;
    const result2 = await wallet.getRegisterStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result2).toBeTruthy();

    wallet.services.getRegisterStatus = async () => undefined as any;
    const result3 = await wallet.getRegisterStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result3).toBeUndefined();
  });

  test('test register branch', async () => {
    const wallet = getWallet();
    wallet.create = () => {
      return undefined as any;
    };
    const result = await wallet.register({
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      chainId: 'AELF',
    } as any);
    expect(result).toBeTruthy();

    try {
      wallet.accountInfo.loginAccount = 'loginAccount_mock';
      await wallet.register({
        loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
        chainId: 'AELF',
      } as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test getLoginStatus branch', async () => {
    const wallet = await getLoggedInWallet();
    wallet.caInfo = undefined as any;
    const result = await wallet.getLoginStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result).toBeTruthy();

    wallet.managementAccount = undefined;
    const result2 = await wallet.getLoginStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result2).toBeTruthy();

    wallet.services = {
      ...wallet.services,
      getRecoverStatus: async () => undefined as any,
    };

    const result3 = await wallet.getLoginStatus({
      chainId: 'tDVW',
      sessionId: 'sessionId_mock',
    });
    expect(result3).toBeUndefined();
  });

  test('test login branch', async () => {
    const wallet = getWallet();
    try {
      await wallet.login('scan', {} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    const wallet1 = await getLoggedInWallet();
    try {
      await wallet1.login('loginAccount', {} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    wallet1.addManager = async () => {
      return {
        error: 'error_mock',
      };
    };
    try {
      await wallet1.login('scan', {} as any);
    } catch (error) {
      expect(error).toBeTruthy();
    }
    wallet1.addManager = async () => {
      return undefined;
    };
    const result2 = await wallet1.login('scan', {} as any);
    expect(result2).toBeTruthy();

    const wallet2 = getWallet();
    wallet2.create = () => undefined as any;
    const result = await wallet2.login('loginAccount', {
      loginGuardianIdentifier: 'loginGuardianIdentifier_mock',
      guardiansApproved: [],
      extraData: 'extraData_mock',
      chainId: 'AELF',
      context: {
        clientId: 'clientId_mock',
        requestId: 'requestId_mock',
      },
    });
    expect(result).toBeTruthy();
  });

  test('test checkManagerIsExistByGQL', async () => {
    const wallet = getWallet();
    try {
      await wallet.checkManagerIsExistByGQL({
        managementAddress: 'managementAddress',
        chainId: 'AELF',
        caHash: 'caHash',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test checkManagerIsExistByContract', async () => {
    const wallet = getWallet();
    try {
      await wallet.checkManagerIsExistByContract({
        managementAddress: 'managementAddress',
        chainId: 'AELF',
        caHash: 'caHash',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test checkManagerIsExistByContract1', async () => {
    const wallet = getWallet();
    try {
      wallet.getHolderInfoByContract = () => ({} as any);

      await wallet.checkManagerIsExistByContract({
        managementAddress: 'managementAddress',
        chainId: 'AELF',
        caHash: 'caHash',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test checkManagerIsExistByContract managerInfos is exist', async () => {
    const wallet = getWallet();
    wallet.getHolderInfoByContract = () =>
      ({
        managerInfos: [
          {
            address: 'mock_management_Address',
          },
        ],
      } as any);

    const res = await wallet.checkManagerIsExistByContract({
      managementAddress: 'mock_management_Address',
      chainId: 'AELF',
      caHash: 'caHash',
    });
    expect(res).toBeTruthy();
  });

  test('test checkManagerIsExistByContract managerInfos is empty', async () => {
    const wallet = getWallet();
    wallet.getHolderInfoByContract = () =>
      ({
        managerInfos: [{ address: '' }, null],
      } as any);

    const res = await wallet.checkManagerIsExistByContract({
      managementAddress: 'mock_management_Address',
      chainId: 'AELF',
      caHash: 'caHash',
    });
    expect(res).toBeFalsy();
  });

  test('test checkManagerIsExist by checkManagerIsExistByGQL', async () => {
    const wallet = getWallet();
    try {
      await wallet.checkManagerIsExist({
        managementAddress: 'managementAddress',
        chainId: 'AELF',
        caHash: 'caHash',
      });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test checkManagerIsExist by checkManagerIsExistByContract', async () => {
    const wallet = getWallet();
    wallet.checkManagerIsExistByGQL = async () => false;
    wallet.checkManagerIsExistByContract = async () => true;
    const res = await wallet.checkManagerIsExist({
      managementAddress: 'managementAddress',
      chainId: 'AELF',
      caHash: 'caHash',
    });
    expect(res).toBeTruthy();
  });
});
