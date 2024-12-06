import { describe, expect, test, vi } from 'vitest';
import { getNextBIP44Path, isEqAddress, isPrivateKey, handlePrivateKey } from '../src/wallet';

describe('wallet describe', () => {
  test('test getNextBIP44Path', () => {
    const result = getNextBIP44Path("m/44'/1616'/0'/0/0");
    expect(result).toEqual("m/44'/1616'/0'/0/1");

    const result2 = getNextBIP44Path('x');
    expect(result2).toEqual("m/44'/1616'/0'/0/0");
  });

  test('test isEqAddress', () => {
    const result = isEqAddress('abc', 'ABC');
    expect(result).toEqual(true);

    const result2 = isEqAddress('abc', '123');
    expect(result2).toEqual(false);

    const result3 = isEqAddress();
    expect(result3).toEqual(true);
  });

  test('test isPrivateKey', () => {
    const result = isPrivateKey('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
    expect(result).toEqual(true);

    const result2 = isPrivateKey({} as any);
    expect(result2).toEqual(false);

    try {
      const result3 = isPrivateKey('test');
      expect(result3).toEqual(false);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', `mocked error`);
    }
  });

  test('test handlePrivateKey', () => {
    const result = handlePrivateKey('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
    expect(result).toEqual('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');

    const result2 = handlePrivateKey('0x943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
    expect(result2).toEqual('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
  });
});
