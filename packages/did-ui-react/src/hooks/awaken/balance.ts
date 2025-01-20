import BigNumber from 'bignumber.js';
import { useCallback, useMemo, useState } from 'react';
import { useDAppChainId } from '../useChainInfo';
import { useGetTokenViewContract } from '../contract';
import { usePortkeyAsset } from '../../components';
import { getELFChainBalance } from '../../utils/balance';
import { ZERO } from '../../constants/misc';
import useInterval from '../useInterval';

export type TBalancesV2 = { [symbol: string]: BigNumber } | undefined;

const bigNAN = new BigNumber('');
export const useBalancesV2 = (
  // address || symbol
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
): [TBalancesV2, () => void] => {
  const deArr: TBalancesV2 | undefined = useMemo(() => {
    if (!tokens) return;
    if (Array.isArray(tokens)) {
      return tokens.reduce((acc: any, symbol) => {
        if (symbol) {
          acc[symbol] = bigNAN;
          return acc;
        }
        return acc;
      }, {});
    }
    return { [tokens]: bigNAN };
  }, [tokens]);
  const [balances, setBalances] = useState<TBalancesV2>(deArr);
  const chainId = useDAppChainId();
  const getTokenViewContract = useGetTokenViewContract();

  const [{ caInfo }] = usePortkeyAsset();
  const onGetBalance = useCallback(async () => {
    const tokensList = Array.isArray(tokens) ? tokens : [tokens];
    const account = caInfo?.[chainId]?.caAddress;

    if (!account || !chainId) {
      return setBalances(
        tokensList.reduce((acc: any, symbol) => {
          if (symbol) {
            acc[symbol] = bigNAN;
            return acc;
          }
          return acc;
        }, {}),
      );
    }
    // elf chain
    const contract = await getTokenViewContract(chainId);

    if (!contract) return;
    const bs: TBalancesV2 = {};
    const promise = tokensList.map(async (symbol) => {
      if (symbol) {
        const _symbol = symbol;
        const balance = await getELFChainBalance(contract, _symbol, account);
        bs[_symbol] = ZERO.plus(balance ?? '');
      }
    });
    await Promise.all(promise);

    setBalances(bs);
  }, [caInfo, chainId, getTokenViewContract, tokens]);

  useInterval(onGetBalance, delay, [onGetBalance]);

  return [balances, onGetBalance];
};

export const useCurrencyBalancesV2 = (symbols: string[], delay: null | number = 10000) => {
  const [bs] = useBalancesV2(symbols, delay);
  return bs;
};
