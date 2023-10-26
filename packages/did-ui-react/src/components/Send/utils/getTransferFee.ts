import { ChainId, ChainType } from '@portkey/types';
import { isCrossChain } from '../../../utils/aelf';
import { BaseToken } from '../../types/assets';
import { DEFAULT_TOKEN } from '../../../constants/assets';
import { getChain } from '../../../hooks/useChainInfo';
import { getTransactionFee } from '../../../utils/sandboxUtil/getTransactionFee';
import { divDecimalsStr, timesDecimals } from '../../../utils/converter';
import { ZERO } from '../../../constants/misc';
import { getBalanceByContract } from '../../../utils/sandboxUtil/getBalance';

const getTransferFee = async ({
  sandboxId,
  managerAddress,
  toAddress,
  privateKey,
  chainId,
  chainType,
  token,
  caHash,
  amount,
  memo = '',
  crossChainFee,
}: {
  sandboxId?: string;
  managerAddress: string;
  chainType: ChainType;
  chainId: ChainId;
  privateKey: string;
  toAddress: string;
  token: BaseToken;
  caHash: string;
  amount: number;
  memo?: string;
  crossChainFee?: number;
}) => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  if (isCrossChain(toAddress, chainId)) {
    // first
    let _firstFee = ZERO;
    const firstTxResult = await getTransactionFee({
      contractAddress: chainInfo.caContractAddress,
      rpcUrl: chainInfo.endPoint,
      chainType,
      methodName: 'ManagerTransfer',
      privateKey,
      paramsOption: {
        caHash,
        symbol: token.symbol,
        to: managerAddress,
        amount,
        memo,
      },
    });
    _firstFee = firstTxResult['ELF'];

    if (token.symbol !== DEFAULT_TOKEN.symbol) {
      const managerBalanceRes = await getBalanceByContract({
        sandboxId,
        chainType,
        chainId: chainId,
        tokenContractAddress: token.address,
        paramsOption: {
          owner: managerAddress,
          symbol: DEFAULT_TOKEN.symbol,
        },
      });
      const managerBalance = managerBalanceRes.balance;

      const crossChainFeeAmount = timesDecimals(crossChainFee, DEFAULT_TOKEN.decimals);
      if (crossChainFeeAmount.gt(managerBalance)) {
        const crossELFRes = await getTransactionFee({
          contractAddress: chainInfo.caContractAddress,
          rpcUrl: chainInfo.endPoint,
          chainType,
          methodName: 'ManagerTransfer',
          privateKey,
          paramsOption: {
            caHash,
            symbol: DEFAULT_TOKEN.symbol,
            to: managerAddress,
            amount: crossChainFeeAmount.toFixed(0),
            memo,
          },
        });
        const crossELFFee = crossELFRes['ELF'];

        _firstFee = ZERO.plus(_firstFee).plus(crossELFFee);
      }
    }
    const firstFee = divDecimalsStr(_firstFee, DEFAULT_TOKEN.decimals);
    console.log(firstTxResult, 'transactionRes===cross');
    if (Number.isNaN(ZERO.plus(firstFee).toNumber())) {
      return '0';
    } else {
      return firstFee;
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
    const feeRes = transactionRes['ELF'];
    return divDecimalsStr(feeRes, DEFAULT_TOKEN.decimals);
  }
};

export default getTransferFee;
