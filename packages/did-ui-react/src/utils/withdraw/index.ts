import { eTransferCore } from '@etransfer/core';
import { ContractBasic } from '@portkey/contracts';
import { ChainId, IBlockchainWallet } from '@portkey/types';
import { PortkeyVersion } from '@etransfer/types';
import AElf from 'aelf-sdk';
import { ICrossTransfer, ICrossTransferInitOption, IWithdrawParams, IWithdrawPreviewParams } from './types';
import { sleep } from '@portkey/utils';
import { isAuthTokenError } from '@etransfer/utils';
import { LocalStorageKey } from '@etransfer/utils';
import { removeDIDAddressSuffix } from '@etransfer/utils';
import { ZERO } from '../../constants/misc';
import { timesDecimals } from '../converter';
import { CustomContractBasic } from '../sandboxUtil/CustomContractBasic';
import { getChain } from '../../hooks';
import { callCASendMethod } from '../sandboxUtil/callCASendMethod';
import { aelf } from '@portkey/utils';

export const CROSS_CHAIN_ETRANSFER_SUPPORT_SYMBOL = ['ELF', 'USDT'];
const ETRANSFER_VERSION = '2.13.0';

export class CrossTransfer implements ICrossTransfer {
  options: ICrossTransferInitOption;
  authTokenCount = 0;
  constructor() {
    this.options = {} as any;
  }
  init(options: ICrossTransferInitOption) {
    this.options = options;
    const eTransferUrl = this.options.eTransferUrl;
    eTransferCore.init({
      etransferUrl: eTransferUrl,
      etransferAuthUrl: eTransferUrl,
      storage: this.options.storage,
      version: ETRANSFER_VERSION,
    });
  }

  formatAuthTokenParams = () => {
    const { walletInfo, pin } = this.options;
    const caHash = walletInfo.caHash;
    if (!caHash) throw new Error('Can not get user caHash');
    if (!pin) throw new Error('Locked');

    const aesPrivateKey = walletInfo.AESEncryptPrivateKey;

    const manager = aelf.getWallet(aesPrivateKey) as IBlockchainWallet;
    const plainTextOrigin = `Nonce:${Date.now()}`;
    const plainTextHex = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    const plainTextHexSignature = Buffer.from(plainTextHex).toString('hex');

    const signature = AElf.wallet.sign(plainTextHexSignature, manager.keyPair).toString('hex');
    const pubkey = manager.keyPair.getPublic('hex');
    const managerAddress = manager.address;

    console.log(manager, 'manager===');

    return {
      pubkey,
      signature,
      plainText: plainTextHex,
      caHash,
      managerAddress,
      version: PortkeyVersion.v2,
    };
  };

  checkAllowanceAndApprove = async ({
    chainId,
    portkeyContractAddress,
    tokenContractAddress,
    privateKey,
    symbol,
    spender,
    owner,
    amount,
    caHash,
  }: {
    chainId: ChainId;
    tokenContractAddress: string;
    portkeyContractAddress: string;
    privateKey: string;
    symbol: string;
    spender: string;
    owner: string;
    amount: string;
    caHash: string;
  }) => {
    const chainInfo = await getChain(chainId);
    if (!chainInfo) throw 'Please check network connection and chainId';

    const [allowance, info] = await Promise.all([
      CustomContractBasic.callViewMethod({
        contractOptions: {
          rpcUrl: chainInfo?.endPoint,
          contractAddress: tokenContractAddress,
        },
        functionName: 'GetAllowance',
        paramsOption: {
          symbol,
          owner,
          spender,
        },
      }),

      CustomContractBasic.callViewMethod({
        contractOptions: {
          rpcUrl: chainInfo?.endPoint,
          contractAddress: tokenContractAddress,
        },
        functionName: 'GetTokenInfo',
        paramsOption: {
          symbol,
        },
      }),
    ]);
    console.log(allowance, info, '===allowance, info');
    if (allowance?.error) throw allowance?.error;
    if (info?.error) throw info?.error;
    const allowanceBN = ZERO.plus(allowance.data.allowance ?? allowance.data.amount ?? 0);
    const pivotBalanceBN = timesDecimals(amount, info.data.decimals ?? 8);
    if (allowanceBN.lt(pivotBalanceBN)) {
      const approveResult = await callCASendMethod({
        methodName: 'ManagerApprove',
        paramsOption: {
          caHash,
          spender,
          symbol,
          amount: pivotBalanceBN.toFixed(),
        },
        chainId,
        caHash,
        chainType: 'aelf',
        contractAddress: portkeyContractAddress,
        privateKey,
      });

      if (approveResult?.error) throw approveResult?.error;
      return true;
    }
    return true;
  };

  withdraw: ICrossTransfer['withdraw'] = async (params: IWithdrawParams) => {
    try {
      const {
        privateKey,
        portkeyContractAddress,
        tokenContractAddress,
        chainId,
        toAddress,
        amount,
        tokenInfo,
        network,
        isCheckSymbol = true,
      } = params;
      const { pin, walletInfo, chainList, eTransferCA } = this.options;
      const chainInfo = chainList.find((item) => item.chainId === chainId);
      if (!pin) throw new Error('No Pin');
      // todo: change it
      if (isCheckSymbol && !CROSS_CHAIN_ETRANSFER_SUPPORT_SYMBOL.includes(tokenInfo.symbol))
        throw new Error(`Not support: ${tokenInfo.symbol}`);
      const caAddress = walletInfo.caAddress;
      const eTransferContractAddress = eTransferCA?.[chainId];

      if (!chainInfo) throw new Error('Can not get chainInfo');
      if (!caAddress) throw new Error('Can not get caAddress');
      if (!eTransferContractAddress) throw new Error('Please eTransferContractAddress!');

      const aesPrivateKey = walletInfo.AESEncryptPrivateKey;
      const manager = AElf.wallet.getWalletByPrivateKey(aesPrivateKey) as IBlockchainWallet;

      const managerAddress = manager.address;
      const authParams = this.formatAuthTokenParams();
      const caHash = walletInfo.caHash;
      if (!caHash) throw new Error('Can not get user caHash');
      const authToken = await eTransferCore.getAuthToken({ ...authParams, chainId });
      console.log(authToken, 'authToken===');
      await this.checkAllowanceAndApprove({
        chainId,
        tokenContractAddress,
        symbol: tokenInfo.symbol,
        spender: eTransferContractAddress,
        owner: caAddress,
        caHash,
        amount,
        portkeyContractAddress,
        privateKey,
      });

      const result = await eTransferCore.withdrawOrder({
        endPoint: chainInfo.endPoint,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        amount,
        toAddress,
        caContractAddress: chainInfo.caContractAddress,
        eTransferContractAddress,
        caHash,
        network,
        chainId,
        managerAddress,
        getSignature: async (ser) => {
          const signObj = manager.keyPair.sign(AElf.utils.sha256(ser));
          return {
            signature: [
              signObj.r.toString('hex', 32),
              signObj.s.toString('hex', 32),
              `0${signObj.recoveryParam?.toString()}`,
            ].join(''),
          } as any;
        },
      });

      return result;
    } catch (error) {
      if (this.authTokenCount > 5) throw error;
      if (isAuthTokenError(error)) {
        this.authTokenCount++;
        await this.options.storage?.removeItem(LocalStorageKey.ETRANSFER_ACCESS_TOKEN);
        await sleep(1000);
        return this.withdraw(params);
      }
      throw error;
    }
  };

  withdrawPreview: ICrossTransfer['withdrawPreview'] = async (params: IWithdrawPreviewParams) => {
    try {
      const { chainId, address, symbol, amount, network } = params;

      const authParams = this.formatAuthTokenParams();
      const aToken = await eTransferCore.getAuthToken({ chainId, ...authParams });
      console.log('aToken', aToken);
      const result = await eTransferCore.services.getWithdrawInfo({
        chainId: chainId,
        network,
        symbol,
        amount,
        address: removeDIDAddressSuffix(address) || undefined,
        version: PortkeyVersion.v2,
      });
      this.authTokenCount = 0;

      return result;
    } catch (error: any) {
      if (isAuthTokenError(error)) {
        this.authTokenCount++;
        if (this.authTokenCount > 5) throw error;

        await this.options.storage?.removeItem(LocalStorageKey.ETRANSFER_ACCESS_TOKEN);
        await sleep(1000);

        return this.withdrawPreview(params);
      }
      throw error;
    }
  };
}

export default { CrossTransfer };
