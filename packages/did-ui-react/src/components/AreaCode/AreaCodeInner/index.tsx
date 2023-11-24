import { ChangeEvent, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { ICountryItem } from '../../../types';
import clsx from 'clsx';
import { countryCodeFilter } from '../../../constants/country';
import AreaCodeSearch from '../AreaCodeSearch';
import './index.less';

export default function AreaCodeInner({
  value,
  areaList,
  onChange,
  className,
}: {
  value?: ICountryItem['iso'];
  areaList?: ICountryItem[];
  className?: string;
  onChange?: (item: ICountryItem) => void;
}) {
  const [searchVal, setSearchVal] = useState<string>('');

  const timer = useRef<any>(null);

  const debounce = useCallback((fn: () => void, delay = 500) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(function () {
      fn();
    }, delay);
  }, []);

  const onSearchCountry = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      debounce(() => setSearchVal(val));
    },
    [debounce],
  );

  const onClick: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const item = useCallback(
    (countryItem: ICountryItem) => (
      <li
        key={countryItem.iso}
        className={clsx('portkey-ui-flex-between-center area-code-item', value === countryItem.iso && 'active-item')}
        onClick={() => onChange?.(countryItem)}>
        <span>{countryItem.country}</span>
        <span>+ {countryItem.code}</span>
      </li>
    ),
    [onChange, value],
  );

  const allList = useMemo(() => areaList?.map((country) => item(country)), [areaList, item]);

  const noDate = useMemo(
    () => <div className="portkey-ui-flex-center no-search-result">There is no search result.</div>,
    [],
  );

  const filterList = useMemo(() => {
    const list = countryCodeFilter(searchVal, areaList);
    if (!list.length) return noDate;
    return list.map((country) => item(country));
  }, [areaList, item, noDate, searchVal]);

  return (
    <div
      className={clsx('area-code-inner-wrapper', className)}
      id="area-code"
      style={{ display: 'flex' }}
      onClick={onClick}>
      <AreaCodeSearch onChange={onSearchCountry} />
      <ul className="area-code-content">{!searchVal ? allList : filterList}</ul>
    </div>
  );
}
