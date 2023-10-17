import { describe, expect, test } from '@jest/globals';
import { getAelfInstance, getWallet, getELFContract, encodedTx } from '../src/aelf';

const stageEndpoint = 'https://tdvw-test-node.aelf.io';
const privateKey = '943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096';
const timeout = 30 * 1000;

describe('aelf describe', () => {
  test('test getAelfInstance', () => {
    const aelf = getAelfInstance(stageEndpoint, timeout);
    expect(aelf).not.toBeUndefined();
  });

  test('test getWallet', () => {
    const wallet = getWallet(privateKey);
    expect(wallet.privateKey).toEqual(privateKey);
  });

  test('test getELFContract', async () => {
    const aelf = getAelfInstance(stageEndpoint, timeout);
    const { GenesisContractAddress } = await aelf.chain.getChainStatus();
    const result = await getELFContract(stageEndpoint, GenesisContractAddress, privateKey);
    expect(result.deserializeLog).toBeInstanceOf(Function);
  }, 10000);

  test('test encodedTx', async () => {
    const aelf = getAelfInstance(stageEndpoint, timeout);
    const address = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
    const contract = await getELFContract(stageEndpoint, address, privateKey);

    const result = await encodedTx({
      instance: aelf,
      functionName: 'Transfer',
      paramsOption: {
        symbol: 'ELF',
        amount: 1,
        to: 'soAcchsFZGEsFeaEsk9tyMnFauPgJfMyZMRrfcntGjrtC7YvE',
      },
      contract,
    });
    expect(typeof result).toEqual('string');

    try {
      await encodedTx({} as any);
    } catch (error) {
      expect(error).not.toBeUndefined();
    }
    try {
      await encodedTx({
        instance: { chain: { getChainStatus: () => undefined } },
        functionName: 'Transfer',
        paramsOption: {
          symbol: 'ELF',
          amount: 1,
          to: 'soAcchsFZGEsFeaEsk9tyMnFauPgJfMyZMRrfcntGjrtC7YvE',
        },
        contract,
      });
    } catch (error) {
      expect(error).not.toBeUndefined();
    }
  }, 10000);
});
