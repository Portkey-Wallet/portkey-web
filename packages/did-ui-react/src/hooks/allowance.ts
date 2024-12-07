import { useCallback, useEffect, useState } from 'react';
import { usePortkeyAsset } from '../components';
import { did } from '../utils/did';
import { GetAllowanceResult } from '@portkey/services';

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
export function useDappSpenderCheck(website?: string, spender?: string, logo?: string) {
  const [spenderValid, setSpenderValid] = useState<boolean>(true);
  const checkDappSpenderValid = useCallback(async (website?: string, spender?: string, logo?: string) => {
    const result = await did.services.allowance.checkSpenderValid({
      website: website || '',
      logo: logo || '',
      spender: spender || '',
    });
    setSpenderValid(result);
  }, []);
  useEffect(() => {
    (async () => {
      await checkDappSpenderValid(website, spender, logo);
    })();
  }, [checkDappSpenderValid, logo, spender, website]);
  return spenderValid;
}
