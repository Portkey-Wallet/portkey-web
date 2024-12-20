import { IPortkeyContract } from '@portkey/contracts';
import { ChainId } from '@portkey/types';
import { useCallback } from 'react';
import { divDecimalsStr, timesDecimals } from '../utils/converter';
import { getChainNumber } from '../utils';
import { isMyPayTransactionFee } from '../utils/redux';
import { usePortkeyAsset } from '../components';
import { useDefaultToken } from './assets';
import { getTokenIssueChainId } from '../utils/getTokenIssueChainId';

export type FeeResponse = {
  [symbol: string]: string;
};

export type CalculateTransactionFeeResponse = {
  Success: boolean;
  TransactionFee: FeeResponse | null;
  ResourceFee: FeeResponse | null;
  TransactionFees: {
    ChargingAddress: string;
    Fee: FeeResponse;
  } | null;
  ResourceFees: {
    ChargingAddress: string;
    Fee: FeeResponse;
  } | null;
  Error: string | null;
};

export type GetTransferFeeParams = {
  isCross: boolean;
  sendAmount: string;
  decimals: string;
  symbol: string;
  caContract: IPortkeyContract;
  tokenContractAddress: string;
  toAddress: string;
  chainId: ChainId;
};

export type GetCrossChainTransferFeeParams = {
  tokenContract: IPortkeyContract;
  sendAmount: string;
  decimals: string;
  symbol: string;
  caContract: IPortkeyContract;
  tokenContractAddress: string;
  toAddress: string;
  chainId: ChainId;
  toChainId: ChainId;
};
export const useGetCrossChainTransferFee = () => {
  // const defaultToken = useDefaultToken();
  // const wallet = useCurrentWalletInfo();
  const [{ caInfo, originChainId, caHash }] = usePortkeyAsset();
  const defaultToken = useDefaultToken(originChainId);
  // const [{sandboxId, chainType}] = usePortkey();
  const getCrossChainTransferFee = useCallback(
    async ({
      tokenContract,
      sendAmount,
      decimals,
      symbol,
      caContract,
      tokenContractAddress,
      toAddress,
      toChainId,
      chainId,
    }: GetCrossChainTransferFeeParams) => {
      const issueChainId = await getTokenIssueChainId({ tokenContract, paramsOption: { symbol: symbol } });

      const methodName = 'ManagerForwardCall';
      const calculateParams = {
        caHash: caHash,
        contractAddress: tokenContractAddress,
        methodName: 'CrossChainTransfer',
        args: {
          symbol,
          to: toAddress,
          amount: timesDecimals(sendAmount, decimals).toFixed(),
          memo: '',
          toChainId: getChainNumber(toChainId),
          issueChainId: issueChainId,
        },
      };

      const req = await caContract.calculateTransactionFee(methodName, calculateParams);

      // console.log('resultttt', req);

      // if (req?.error) {
      //   request.errorReport('calculateTransactionFee', calculateParams, req.error);
      // }

      const { TransactionFees, TransactionFee } = (req.data as CalculateTransactionFeeResponse) || {};
      // V2 calculateTransactionFee
      if (TransactionFees) {
        const { ChargingAddress, Fee } = TransactionFees;
        const myPayFee = isMyPayTransactionFee(caInfo, ChargingAddress, chainId);
        if (myPayFee) {
          return divDecimalsStr(Fee?.[defaultToken.symbol], defaultToken.decimals).toString();
        }
        return '0';
      }
      // V1 calculateTransactionFee
      if (TransactionFee) {
        return divDecimalsStr(TransactionFee?.[defaultToken.symbol], defaultToken.decimals).toString();
      }
      throw { code: 500, message: 'no enough fee' };
    },
    [caHash, caInfo, defaultToken.decimals, defaultToken.symbol],
  );

  return getCrossChainTransferFee;
};
// export function useGetCAContract() {
//   const pin = usePin();
//   did.didWallet.pin
//   const { AESEncryptPrivateKey, address } = useCurrentWalletInfo();
//   const [{ caContracts }, dispatch] = useInterface();

//   const getChain = useGetChain();

//   return useCallback(
//     async (chainId: ChainId) => {
//       const chainInfo = getChain(chainId);
//       if (!chainInfo) throw Error('Could not find chain information');
//       const key = `${address}_${chainInfo.caContractAddress}_${chainInfo.chainId}`;
//       const caContract = caContracts?.[chainId]?.[key];
//       if (caContract) return caContract;

//       if (!pin || !AESEncryptPrivateKey) throw Error('Could not find wallet information');

//       const privateKey = aes.decrypt(AESEncryptPrivateKey, pin);
//       const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);

//       const contract = await getContractBasic({
//         contractAddress: chainInfo.caContractAddress,
//         rpcUrl: chainInfo.endPoint,
//         account: wallet,
//       });
//       dispatch(setCAContract({ [key]: contract as ContractBasic }, chainId));
//       return contract as ContractBasic;
//     },
//     [AESEncryptPrivateKey, address, caContracts, dispatch, getChain, pin],
//   );
// }
