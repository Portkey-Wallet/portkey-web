import { AreaCodeProps } from '../index';
import CommonModal from '../../CommonModal';
import { countryCodeFilter, getCountryCodeIndex } from '../../../constants/country';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { IndexBar, List } from 'antd-mobile';
import CustomSvg from '../../CustomSvg';
import TitleWrapper from '../../TitleWrapper';
import './index.less';
import AreaCodeSearch from '../AreaCodeSearch';
import clsx from 'clsx';

export default function AreaCodeDrawer({ open, value, areaList, onChange, onCancel }: AreaCodeProps) {
  // const [filterList, setFilterList] = useState<ICountryItem[] | undefined>(areaList);
  const [searchVal, setSearchVal] = useState<string>('');

  const filterList = useMemo(() => {
    if (!searchVal) return areaList;
    return countryCodeFilter(searchVal, areaList);
  }, [areaList, searchVal]);
  console.log(filterList, searchVal, 'filterList');
  const list = useMemo(() => {
    return getCountryCodeIndex(filterList ?? []);
  }, [filterList]);

  const timer = useRef<any>(null);

  const debounce = useCallback((fn: () => void, delay = 500) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(function () {
      fn();
    }, delay);
  }, []);

  console.log(list, 'list==AreaCodeDrawer');
  const onSearchCountry = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      debounce(() => setSearchVal(val));
    },
    [debounce],
  );

  return (
    <CommonModal
      width={'100%'}
      height={'80vh'}
      placement="right"
      type="drawer"
      className="portkey-ui-area-code-wrapper"
      push={false}
      open={open}
      onClose={onCancel}>
      <TitleWrapper
        className="portkey-ui-area-code-title"
        leftElement={<CustomSvg type="BackLeft" className="left-arrow" />}
        leftCallBack={onCancel}
        title={'Select Country/Region'}
      />
      <AreaCodeSearch onChange={onSearchCountry} />

      {Boolean(list.length) && (
        <IndexBar className="portkey-ui-area-code-list">
          {list.map((group) => {
            const [title, items] = group;
            return (
              <IndexBar.Panel index={title} title={title} key={title}>
                <List>
                  {items.map((countryItem, index) => (
                    <List.Item
                      className={clsx(value === countryItem.iso && 'active-item')}
                      arrow={false}
                      key={index}
                      onClick={() => onChange?.(countryItem)}>
                      <span>{countryItem.country}</span>
                      <span>+ {countryItem.code}</span>
                    </List.Item>
                  ))}
                </List>
              </IndexBar.Panel>
            );
          })}
        </IndexBar>
      )}

      {searchVal && !list.length && (
        <div className="portkey-ui-flex-center no-search-result">There is no search result.</div>
      )}
    </CommonModal>
  );
}
