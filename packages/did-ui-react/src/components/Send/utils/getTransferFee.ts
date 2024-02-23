import { ChainId, ChainType } from '@portkey/types';
import { isCrossChain } from '../../../utils/aelf';
import { BaseToken } from '../../types/assets';
import { DEFAULT_TOKEN } from '../../../constants/assets';
import { getChain } from '../../../hooks/useChainInfo';
import { getTransactionFee } from '../../../utils/sandboxUtil/getTransactionFee';
import { divDecimalsStr } from '../../../utils/converter';
import { wallet } from '@portkey/utils';
import { ZERO } from '../../../constants/misc';

const getTransferFee = async ({
  caAddress,
  managerAddress,
  toAddress,
  privateKey,
  chainId,
  chainType,
  token,
  caHash,
  amount,
  memo = '',
}: {
  caAddress: string;
  managerAddress: string;
  chainType: ChainType;
  chainId: ChainId;
  privateKey: string;
  toAddress: string;
  token: BaseToken;
  caHash: string;
  amount: number;
  memo?: string;
}) => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  if (isCrossChain(toAddress, chainId)) {
    const firstTxResult = await getTransactionFee({
      contractAddress: chainInfo.caContractAddress,
      rpcUrl: chainInfo.endPoint,
      chainType,
      methodName: 'ManagerForwardCall',
      privateKey,
      paramsOption: {
        caHash,
        contractAddress: token.address,
        methodName: 'Transfer',
        args: {
          symbol: token.symbol,
          to: managerAddress,
          amount,
          memo,
        },
      },
    });
    console.log(firstTxResult, 'transactionRes===cross');
    const { TransactionFees, TransactionFee } = firstTxResult;
    if (TransactionFees) {
      const { Fee, ChargingAddress } = TransactionFees;
      const _fee = Fee?.[DEFAULT_TOKEN.symbol];
      const fee = divDecimalsStr(_fee, DEFAULT_TOKEN.decimals);

      // fee fro free
      if (Number.isNaN(ZERO.plus(fee).toNumber())) {
        return '0';
      }

      if (ChargingAddress) {
        // no check manager address
        if (wallet.isEqAddress(caAddress, ChargingAddress)) {
          return fee;
        }
      }
      return '0';
    } else {
      const _fee = TransactionFee?.[DEFAULT_TOKEN.symbol];
      const fee = divDecimalsStr(_fee, DEFAULT_TOKEN.decimals);

      // fee fro free
      if (Number.isNaN(ZERO.plus(fee).toNumber())) {
        return '0';
      }
      return fee;
    }
  } else {
    const transactionRes = await getTransactionFee({
      contractAddress: chainInfo.caContractAddress,
      rpcUrl: chainInfo.endPoint,
      chainType,
      methodName: 'ManagerForwardCall',
      privateKey,
      paramsOption: {
        caHash,
        contractAddress: token.address,
        methodName: 'Transfer',
        args: {
          symbol: token.symbol,
          to: toAddress,
          amount,
          memo,
        },
      },
    });
    console.log(transactionRes, 'transactionRes===');
    const { TransactionFees, TransactionFee } = transactionRes;
    if (TransactionFees) {
      const { Fee, ChargingAddress } = TransactionFees;
      const _fee = Fee?.[DEFAULT_TOKEN.symbol];
      const fee = divDecimalsStr(_fee, DEFAULT_TOKEN.decimals);

      // fee fro free
      if (Number.isNaN(ZERO.plus(fee).toNumber())) {
        return '0';
      }

      if (ChargingAddress) {
        if (wallet.isEqAddress(caAddress, ChargingAddress)) {
          return fee;
        }
        return '0';
      }
      return fee;
    } else {
      const _fee = TransactionFee?.[DEFAULT_TOKEN.symbol];
      const fee = divDecimalsStr(_fee, DEFAULT_TOKEN.decimals);

      // fee fro free
      if (Number.isNaN(ZERO.plus(fee).toNumber())) {
        return '0';
      }
      return fee;
    }
  }
};

export default getTransferFee;
