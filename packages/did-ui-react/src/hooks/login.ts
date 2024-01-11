import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { AccountLoginList } from '../constants/guardian';

export interface useComputeIconCountPreRow<T> {
  ref: RefObject<HTMLDivElement>;
  accountList: T[];
  supportList?: T[];
  minLoginAccountIconWidth?: number;
  minIconGap?: number;
}

export function useComputeIconCountPreRow<T>({
  ref,
  accountList,
  supportList = AccountLoginList as T[],
  minLoginAccountIconWidth = 74,
  minIconGap = 12,
}: useComputeIconCountPreRow<T>) {
  const [maxCountPerRow, setMaxCountPerRow] = useState<number>(5);
  const [realCountPerRow, setRealCountPerRow] = useState<number>(5);
  const [iconWidthPerRow, setIconWidthPerRow] = useState<number>(minLoginAccountIconWidth);
  const [iconRealGap, setIconRealGap] = useState<number>(minIconGap);

  const filterSupportAccounts = useMemo(
    () => accountList?.filter((item) => supportList.includes(item)),
    [accountList, supportList],
  );
  const isNeedFold = useMemo(
    () => filterSupportAccounts?.length > realCountPerRow,
    [realCountPerRow, filterSupportAccounts?.length],
  );
  const defaultDisplayList = useMemo(
    () => (isNeedFold ? filterSupportAccounts?.slice(0, realCountPerRow - 1) : filterSupportAccounts),
    [realCountPerRow, isNeedFold, filterSupportAccounts],
  );
  const expendDisplayList = useMemo(
    () => (isNeedFold ? filterSupportAccounts?.slice(realCountPerRow - 1, filterSupportAccounts?.length) : []),
    [realCountPerRow, isNeedFold, filterSupportAccounts],
  );

  const compute = useCallback(() => {
    const containerWidth = ref.current?.clientWidth;
    if (!containerWidth) return;

    const maxCountPerRpw = Math.floor((containerWidth + minIconGap) / (minLoginAccountIconWidth + minIconGap));
    setMaxCountPerRow(maxCountPerRpw);

    const realCountPerRpw =
      Array.isArray(filterSupportAccounts) && filterSupportAccounts?.length < maxCountPerRpw
        ? filterSupportAccounts?.length
        : maxCountPerRpw;
    setRealCountPerRow(realCountPerRpw);

    const iconWidthPerRow = Math.floor((containerWidth + minIconGap) / realCountPerRpw - minIconGap);
    setIconWidthPerRow(iconWidthPerRow);

    const iconRealGap = Math.floor((containerWidth - maxCountPerRpw * minLoginAccountIconWidth) / (maxCountPerRpw - 1));
    setIconRealGap(iconRealGap);
    return {
      isNeedFold,
      maxCountPerRpw,
      realCountPerRpw,
      iconWidthPerRow,
      expendDisplayList,
      defaultDisplayList,
    };
  }, [
    defaultDisplayList,
    expendDisplayList,
    filterSupportAccounts,
    isNeedFold,
    minIconGap,
    minLoginAccountIconWidth,
    ref,
  ]);

  useEffect(() => {
    window.addEventListener('resize', compute);
    compute();

    return () => {
      window.removeEventListener('resize', compute);
    };
  }, [compute]);

  return {
    compute,
    isNeedFold,
    maxCountPerRow,
    realCountPerRow,
    iconWidthPerRow,
    iconRealGap,
    expendDisplayList,
    defaultDisplayList,
  };
}
