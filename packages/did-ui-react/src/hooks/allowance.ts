import { useCallback, useEffect, useState } from 'react';
import { usePortkeyAsset } from '../components';
import { did } from '../utils/did';
import { GetAllowanceResult } from '@portkey/services';
import { checkTimeOver12, formatDateTime } from '@portkey/utils';
import { useGetContractUpgradeTime } from '@portkey/graphql';
import { ChainId } from '@portkey/types';
import { NetworkType } from '../types';

export const useAllowanceList = ({ step = 10 }: { step?: number }) => {
  const [allowanceList, setAllowanceList] = useState<GetAllowanceResult>({
    totalRecordCount: Infinity,
    data: [],
  });
  const [{ caAddressInfos }] = usePortkeyAsset();
  const fetchMoreAllowanceList = useCallback(async () => {
    if (!caAddressInfos) throw new Error('caAddressInfos null');
    const { data } = allowanceList;
    const res: GetAllowanceResult | undefined = await did.services.allowance.getAllowanceList({
      maxResultCount: step,
      skipCount: data.length,
      caAddressInfos,
    });
    if (!res) throw new Error('network error');

    setAllowanceList({
      totalRecordCount: res.totalRecordCount,
      data: [...data, ...res.data],
    });
  }, [allowanceList, caAddressInfos, step]);
  return {
    allowanceList,
    fetchMoreAllowanceList,
  };
};
export type TResult = {
  show: boolean;
  text: string;
  type: 'warning' | 'info';
};
export function useDappSpenderCheck(
  website?: string,
  spender?: string,
  logo?: string,
  targetChainId?: ChainId,
  networkType?: NetworkType,
) {
  const [result, setResult] = useState<TResult>({
    show: false,
    text: '',
    type: 'warning',
  });
  const getContractUpgradeTime = useGetContractUpgradeTime(networkType === 'MAINNET');
  const checkDappSpenderValid = useCallback(async (website?: string, spender?: string, logo?: string) => {
    const result = await did.services.allowance.checkSpenderValid({
      website: website || '',
      logo: logo || '',
      spender: spender || '',
    });
    return result;
  }, []);
  useEffect(() => {
    (async () => {
      const spenderValidResult = await checkDappSpenderValid(website, spender, logo);
      const contractResult = await getContractUpgradeTime({
        input: {
          chainId: targetChainId || '',
          address: spender || '',
          skipCount: 0,
          maxResultCount: 10,
        },
      });
      const blockTime = contractResult.data.contractList.items[0].metadata.block.blockTime;
      const result: TResult = {
        show: false,
        text: '',
        type: 'warning',
      };
      result.show = !spenderValidResult || !!blockTime;
      if (!spenderValidResult && !blockTime) {
        result.text = `The dApp's logo, domain, or address you're approving may not be authentic. Please proceed with caution.`;
      } else if (!spenderValidResult && blockTime) {
        const upgradeTime = formatDateTime(blockTime);
        result.text = `The dApp's logo, domain, or address you're approving may not be authentic. Please proceed with caution.\nThe dApp's smart contract has been updated. Contract update time: ${upgradeTime}`;
      } else if (blockTime && spenderValidResult) {
        const isTimeOver12 = checkTimeOver12(blockTime);
        const upgradeTime = formatDateTime(blockTime);
        result.text = `Contract update time: ${upgradeTime} The dApp's smart contract has been updated. Please proceed with caution.`;
        result.type = isTimeOver12 ? 'info' : 'warning';
      }
      setResult(result);
    })();
  }, [checkDappSpenderValid, getContractUpgradeTime, logo, spender, targetChainId, website]);
  return result;
}
