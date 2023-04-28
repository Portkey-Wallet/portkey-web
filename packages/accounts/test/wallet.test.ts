import { describe, expect, test } from '@jest/globals';

import AElf from 'aelf-sdk';
import { Wallet } from '../src/wallet';
import { AccountProvider } from '../src/portkey/accountProvider';
import { Store } from './__mocks__/store';
const accountProvider = new AccountProvider();
const store = new Store();

const wallet = new Wallet(accountProvider, store);
const privateKey = '03bd0cea9730bcfc8045248fd7f4841ea19315995c44801a3dfede0ca872f808';
const defaultPassword = '123123';

describe('wallet describe', () => {
  test('test create', () => {
    wallet.create(2);
    expect(wallet.length).toEqual(2);
  });

  test('test clear', () => {
    wallet.clear();
    expect(wallet.length).toEqual(0);
  });

  test('test add', () => {
    wallet.clear();
    wallet.add(accountProvider.create());
    expect(wallet.length).toEqual(1);

    wallet.add(privateKey);
    expect(wallet.length).toEqual(2);
    expect(wallet[1].privateKey).toEqual(privateKey);

    const firstAddress = wallet[0].address;
    wallet.add(wallet[0]);
    expect(wallet.length).toEqual(2);
    expect(wallet[0].address).toEqual(firstAddress);
  });

  test('test get', () => {
    const firstAddress = wallet[0].address;
    const firstWallet = wallet.get(firstAddress);
    expect(firstWallet?.address).toEqual(firstAddress);

    const noWallet = wallet.get('noWallet');
    expect(noWallet).toBeUndefined();

    const firstWalletByIndex = wallet.get(0);
    expect(firstWalletByIndex?.address).toEqual(firstAddress);
  });

  test('test remove', () => {
    wallet.clear();
    wallet.create(3);
    let firstAddress = wallet[0].address;
    let flag = wallet.remove(firstAddress);
    expect(flag).toBeTruthy();
    expect(wallet.length).toEqual(2);
    expect(wallet[0].address).not.toEqual(firstAddress);

    flag = wallet.remove('noWallet');
    expect(flag).toBeFalsy();

    firstAddress = wallet[0].address;
    flag = wallet.remove(0);
    expect(flag).toBeTruthy();
    expect(wallet.length).toEqual(1);
    expect(wallet[0].address).not.toEqual(firstAddress);

    flag = wallet.remove(5);
    expect(flag).toBeFalsy();
  });

  test('test encrypt', async () => {
    wallet.clear();
    wallet.create(2);
    const keystoreList = await wallet.encrypt(defaultPassword);
    expect(keystoreList.length).toEqual(2);
    const { privateKey } = AElf.wallet.keyStore.unlockKeystore(keystoreList[0], defaultPassword);
    expect(privateKey).toEqual(wallet[0].privateKey);
  });

  test('test decrypt', async () => {
    wallet.clear();
    wallet.create(2);
    const keystoreList = await wallet.encrypt(defaultPassword);
    const newWallet = new Wallet(accountProvider, store);
    await newWallet.decrypt(keystoreList, defaultPassword);
    expect(newWallet.length).toEqual(2);
    expect(newWallet[0].privateKey).toEqual(wallet[0].privateKey);
  });

  test('test save', async () => {
    wallet.clear();
    wallet.create(2);
    await wallet.save(defaultPassword);
    expect(store.getItem('portkey_sdk_wallet')).toBeTruthy();

    await wallet.save(defaultPassword, 'test');
    expect(store.getItem('test')).toBeTruthy();
  });

  test('test load', async () => {
    wallet.clear();
    wallet.create(2);
    await wallet.save(defaultPassword);
    wallet.clear();
    expect(wallet.length).toEqual(0);
    await wallet.load(defaultPassword);
    expect(wallet.length).toEqual(2);

    await wallet.save(defaultPassword, 'test_load');
    wallet.clear();
    expect(wallet.length).toEqual(0);

    await wallet.load(defaultPassword, 'test_error_keyName');
    expect(wallet.length).toEqual(0);

    await wallet.load(defaultPassword, 'test_load');
    expect(wallet.length).toEqual(2);

    wallet.clear();
    store.setItem('test_error_store', 'false');
    await wallet.load(defaultPassword, 'test_error_store');
    expect(wallet.length).toEqual(0);
  });

  test('test no storage', async () => {
    const wallet = new Wallet(accountProvider, undefined as any);
    wallet.create(2);
    try {
      await wallet.save(defaultPassword);
    } catch (error) {
      expect(error).not.toBeUndefined();
    }

    try {
      await wallet.load(defaultPassword);
    } catch (error) {
      expect(error).not.toBeUndefined();
    }
  });

  test('test add branch', () => {
    const wallet = new Wallet(accountProvider, store);
    wallet.create(2);
    (wallet as any)._addressMap.clear();
    wallet.get = () => ({} as any);
    wallet.add(wallet[0]);
    expect(wallet.length).toEqual(3);
  });
});
