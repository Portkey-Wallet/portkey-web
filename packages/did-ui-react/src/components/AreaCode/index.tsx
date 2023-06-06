import { Input } from 'antd';
import clsx from 'clsx';
import { ChangeEvent, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomSvg from '../CustomSvg';
import { CountryItem } from '../../types';
import { countryCodeFilter } from '../../constants/country';
import './index.less';

interface AreaCodeProps {
  open?: boolean;
  value?: CountryItem['iso'];
  areaList?: CountryItem[];
  onCancel?: () => void;
  onChange?: (item: CountryItem) => void;
}

export default function AreaCode({ open, value, areaList, onChange, onCancel }: AreaCodeProps) {
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

  useEffect(() => {
    if (!open) return;
    const listener = () => onCancel?.();
    window.addEventListener('click', listener);
    return () => {
      window.removeEventListener('click', listener);
    };
  }, [onCancel, open]);

  const onClick: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const item = useCallback(
    (countryItem: CountryItem) => (
      <li
        key={countryItem.iso}
        className={clsx('flex-between-center area-code-item', value === countryItem.iso && 'active-item')}
        onClick={() => onChange?.(countryItem)}>
        <span>{countryItem.country}</span>
        <span>+ {countryItem.code}</span>
      </li>
    ),
    [onChange, value],
  );

  const allList = useMemo(() => areaList?.map((country) => item(country)), [areaList, item]);

  const noDate = useMemo(() => <div className="flex-center no-search-result">There is no search result.</div>, []);

  const filterList = useMemo(() => {
    const list = countryCodeFilter(searchVal, areaList);
    if (!list.length) return noDate;
    return list.map((country) => item(country));
  }, [areaList, item, noDate, searchVal]);

  return (
    <div className="area-code-wrapper" id="area-code" style={{ display: open ? 'flex' : 'none' }} onClick={onClick}>
      <div className="input-wrapper">
        <Input
          className="clear-input-border search-input"
          prefix={<CustomSvg type="SearchBlur" className="search-svg" />}
          placeholder="Search countries and regions"
          onChange={onSearchCountry}
        />
      </div>
      <ul className="area-code-content">{!searchVal ? allList : filterList}</ul>
    </div>
  );
}
