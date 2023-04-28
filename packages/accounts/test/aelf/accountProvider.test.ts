import { describe, expect, test } from '@jest/globals';
import { AccountProvider } from '../../src/aelf/accountProvider';

const privateKey = '03bd0cea9730bcfc8045248fd7f4841ea19315995c44801a3dfede0ca872f808';
const accountProvider = new AccountProvider();
const defaultPassword = '123123';

describe('accountProvider describe', () => {
  test('test create', () => {
    const result = accountProvider.create();

    expect(result).toHaveProperty('privateKey');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('wallet');

    const mnemonicResult = accountProvider.create();
    expect(mnemonicResult.wallet.mnemonic).toEqual(result.wallet.mnemonic);
  });

  test('test privateKeyToAccount', () => {
    const result = accountProvider.privateKeyToAccount(privateKey);
    expect(result.privateKey).toEqual(privateKey);
  });

  test('test decrypt', async () => {
    const walletAccount = accountProvider.privateKeyToAccount(privateKey);
    const keystore = await walletAccount.encrypt(defaultPassword);

    const result = await accountProvider.decrypt(keystore, defaultPassword);
    expect(result.privateKey).toEqual(walletAccount.privateKey);
  });
});
