import AElf from 'aelf-sdk';
import { IAccountProvider, IBlockchainWallet, IKeyStore } from '@portkey-v1/types';
import { WalletAccount } from './walletAccount';
import { wallet } from '@portkey-v1/utils';

export class AccountProvider implements IAccountProvider<WalletAccount> {
  private _BIP44Path: string;
  private _mnemonic?: string;
  public constructor(BIP44Path: string = "m/44'/1616'/0'/0/0") {
    this._BIP44Path = BIP44Path;
  }

  public create(BIP44Path?: string) {
    if (!BIP44Path) {
      BIP44Path = this._BIP44Path;
      this._BIP44Path = wallet.getNextBIP44Path(BIP44Path);
    }
    let baseWallet: IBlockchainWallet;
    if (this._mnemonic) {
      baseWallet = AElf.wallet.getWalletByMnemonic(this._mnemonic, BIP44Path);
    } else {
      baseWallet = AElf.wallet.createNewWallet(BIP44Path);
      this._mnemonic = baseWallet.mnemonic;
    }
    return new WalletAccount(baseWallet);
  }

  public privateKeyToAccount(privateKey: string) {
    const baseWallet: IBlockchainWallet = AElf.wallet.getWalletByPrivateKey(privateKey);
    return new WalletAccount(baseWallet);
  }

  public async decrypt(keystore: IKeyStore, password: string, _options?: Record<string, unknown>) {
    const { privateKey } = AElf.wallet.keyStore.unlockKeystore(keystore, password);
    return this.privateKeyToAccount(privateKey);
  }
}
