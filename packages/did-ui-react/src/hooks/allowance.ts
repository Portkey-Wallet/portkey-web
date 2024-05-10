import { useCallback, useState } from 'react';
import { usePortkeyAsset } from '../components';
import { did } from '../utils/did';
import { GetAllowanceResult } from '@portkey/services';

export const useAllowanceList = ({ step = 10 }: { step?: number }) => {
  const [allowanceList, setAllowanceList] = useState<GetAllowanceResult>({
    totalRecordCount: Infinity,
    data: [],
  });
  const [{ caAddressInfos }] = usePortkeyAsset();
  const updateAllowanceList = useCallback(async () => {
    if (!caAddressInfos) throw new Error('caAddressInfos null');
    const { data } = allowanceList;
    const res: GetAllowanceResult | undefined = await did.services.allowance.getAllowanceList({
      maxResultCount: step,
      skipCount: data.length,
      caAddressInfos,
    });
    if (!res || !(res.data?.length > 0)) throw new Error('network error');

    setAllowanceList({
      totalRecordCount: res.totalRecordCount,
      data: [...data, ...res.data],
    });
  }, [allowanceList, caAddressInfos, step]);
  return {
    allowanceList,
    updateAllowanceList,
  };
};
