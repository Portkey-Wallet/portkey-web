import AElf from 'aelf-sdk';
// import Wallet from 'aelf-sdk/src/wallet';
// import KeyStore from 'aelf-sdk/src/util/keyStore';
// import Wallet from 'aelf-sdk/wallet';
// import KeyStore from 'aelf-sdk/keyStore';
import { IAccountProvider, IBlockchainWallet, IKeyStore } from '@portkey/types';
import { wallet } from '@portkey/utils';
import { WalletAccount } from './walletAccount';

export class AccountProvider implements IAccountProvider<WalletAccount> {
  private _BIP44Path: string;
  private _mnemonic?: string;
  public seedWithBuffer = true;
  public constructor(BIP44Path: string = "m/44'/1616'/0'/0/0") {
    this._BIP44Path = BIP44Path;
  }

  public setSeedWithBuffer(seedWithBuffer: boolean) {
    this.seedWithBuffer = seedWithBuffer;
  }

  public create(BIP44Path?: string) {
    if (!BIP44Path) {
      BIP44Path = this._BIP44Path;
      this._BIP44Path = wallet.getNextBIP44Path(BIP44Path);
    }
    let baseWallet: IBlockchainWallet;
    if (this._mnemonic) {
      // baseWallet = Wallet.getWalletByMnemonic(this._mnemonic, BIP44Path, this.seedWithBuffer);
      baseWallet = AElf.wallet.getWalletByMnemonic(this._mnemonic, BIP44Path);
    } else {
      // baseWallet = Wallet.createNewWallet(BIP44Path, this.seedWithBuffer);
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
    // TODO: wait aelf-sdk update.
    const { privateKey } = AElf.utils.keyStore.unlockKeystore(keystore as any, password);
    return this.privateKeyToAccount(privateKey);
  }
}
