import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { TotalAccountTypeList } from '../constants/guardian';

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
  supportList = TotalAccountTypeList as T[],
  minLoginAccountIconWidth = 74,
  minIconGap = 12,
}: useComputeIconCountPreRow<T>) {
  const [maxCountPerRow, setMaxCountPerRow] = useState<number>(5);
  const [realCountPerRow, setRealCountPerRow] = useState<number>(5);
  const [iconWidthPerRow, setIconWidthPerRow] = useState<number>(minLoginAccountIconWidth);
  // gap size: for icon width can be changed
  const [iconRealGap, setIconRealGap] = useState<number>(minIconGap);
  // gap size: for icon width fixed
  const [iconMinWidthRealGap, setIconMinWidthRealGap] = useState<number>(minIconGap);

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

    const realCountPerRow =
      Array.isArray(filterSupportAccounts) && filterSupportAccounts?.length < maxCountPerRpw
        ? filterSupportAccounts?.length
        : maxCountPerRpw;
    setRealCountPerRow(realCountPerRow);

    const iconWidthPerRow = Math.floor((containerWidth + minIconGap) / realCountPerRow - minIconGap);
    setIconWidthPerRow(iconWidthPerRow);

    const iconRealGap = Math.floor((containerWidth - realCountPerRow * iconWidthPerRow) / (realCountPerRow - 1));
    setIconRealGap(iconRealGap);

    const iconMinWidthRealGap = Math.floor(
      (containerWidth - realCountPerRow * minLoginAccountIconWidth) / (realCountPerRow - 1),
    );
    setIconMinWidthRealGap(iconMinWidthRealGap);
    return {
      isNeedFold,
      maxCountPerRpw,
      realCountPerRow,
      iconWidthPerRow,
      iconRealGap,
      iconMinWidthRealGap,
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
    // listener div resize, can't change smoothly
    // the window size does not change, but the div size changed. eg: Web2Design size="L", right hidden
    const div = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;
      compute();
    });
    resizeObserver.observe(div as HTMLDivElement);

    return (): void => {
      resizeObserver.unobserve(div as HTMLDivElement);
    };
  }, [compute, ref]);

  useEffect(() => {
    // listener window resize, can change smoothly
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
    iconMinWidthRealGap,
    expendDisplayList,
    defaultDisplayList,
  };
}
