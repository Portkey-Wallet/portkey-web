import AElf from 'aelf-sdk';
import { IBaseWalletAccount, IBlockchainWallet, IKeyStore, ISignature } from '@portkey/types';

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
    return AElf.utils.keyStore.getKeystore(this.wallet, password, options as any) as unknown as Promise<IKeyStore>;
  }

  public async signTransaction<T extends Record<string, unknown>>(
    tx: Record<string, unknown>,
  ): Promise<T & ISignature> {
    return AElf.utils.transaction.signTransaction(tx as any, this.wallet.keyPair) as unknown as Promise<T & ISignature>;
  }
}
