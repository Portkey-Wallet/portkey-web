import AElf from 'aelf-sdk';
import { IBaseWalletAccount, IBlockchainWallet, IKeyStore, ISignature } from '@portkey-v1/types';

export class WalletAccount implements IBaseWalletAccount {
  [key: string]: unknown;
  address: string;
  privateKey: string;
  wallet: IBlockchainWallet;
  constructor(wallet: IBlockchainWallet) {
    this.wallet = wallet;
    this.address = wallet.address;
    this.privateKey = wallet.privateKey;
  }

  /**
   * @param hexString hex string
   * @returns hex string
   */
  public sign(hexString: string): Buffer {
    return AElf.wallet.sign(hexString, this.wallet.keyPair);
  }

  public async encrypt(password: string, options?: Record<string, unknown>): Promise<IKeyStore> {
    return AElf.wallet.keyStore.getKeystore(this.wallet, password, options);
  }

  public async signTransaction<T extends Record<string, unknown>>(
    tx: Record<string, unknown>,
  ): Promise<T & ISignature> {
    return AElf.wallet.signTransaction(tx, this.wallet.keyPair);
  }
}
