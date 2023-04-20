import { describe, expect, test } from '@jest/globals';
import AElf from 'aelf-sdk';
import { WalletAccount } from '../../src/portkey/walletAccount';

const privateKey = '03bd0cea9730bcfc8045248fd7f4841ea19315995c44801a3dfede0ca872f808';
const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);
const walletAccount = new WalletAccount(wallet);
const defaultPassword = '123123';

describe('walletAccount describe', () => {
  test('test sign', () => {
    const result = walletAccount.sign('68656c6c6f20776f726c64');
    expect(result.toString('hex')).toBe(
      '276aa36fcab0ac3d4071a4bfb868f636d1a9639916afe4ec329529014f923a372b688b4eb59d6587481bc15e4a1684e1d92b7598967767713d1504dcea83dadb01',
    );
  });

  test('test encrypt', async () => {
    const result = await walletAccount.encrypt(defaultPassword);
    const { privateKey } = AElf.wallet.keyStore.unlockKeystore(result, defaultPassword);
    expect(privateKey).toEqual(walletAccount.privateKey);
  });

  test('test signTransaction', async () => {
    const rawTxn = AElf.pbUtils.getTransaction(
      'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
      'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
      'test',
      ['hello', 'world'],
    );
    const signWallet = await walletAccount.signTransaction(rawTxn);
    expect(signWallet).toHaveProperty('signature');
    expect(signWallet.signature).toBeInstanceOf(Buffer);
    expect(signWallet.signature.toString('hex')).toBe(
      'a3518c1487e019f1de7dca2ea628044f559200a6215c213f7c10cd27e86984d236e056d5b0db6123d6b52e4cb8be5a883c32508f1daef16158907c894154b20b01',
    );

    // const rawTxnNullParams = AElf.pbUtils.getTransaction(
    //   'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
    //   'ELF_65dDNxzcd35jESiidFXN5JV8Z7pCwaFnepuYQToNefSgqk9',
    //   'test',
    //   [],
    // );
    // const signWalletNullParams = await walletAccount.signTransaction(rawTxnNullParams);
    // expect(signWalletNullParams).toHaveProperty('signature');
    // expect(signWalletNullParams.signature).toBeInstanceOf(Buffer);
    // expect(signWalletNullParams.signature.toString('hex')).toBe(
    //   'd71aed3a50539a1f7e7e5a797df61f7f23643a3c75af6718b528910be1f146ea398e68b9fd3934d9795025ccb7428378298c634d661ce7661b1034c5507b587301',
    // );
  });
});
