import { ReactNode, useEffect, useState } from 'react';
import DropdownSearch from '../DropdownSearch';
import { useDebounce } from '../../hooks/debounce';
import './index.less';

export default function AssetDropdown({
  placeholder,
  onInputChange,
}: {
  placeholder: string;
  emptyElement?: ReactNode;
  onInputChange?: (val: string) => void;
}) {
  const [openDrop, setOpenDrop] = useState<boolean>(false);
  const [filterWord, setFilterWord] = useState<string>('');

  const [searchVal, setSearchVal] = useState<string>('');

  const debounce = useDebounce(searchVal, 500);

  useEffect(() => {
    setSearchVal('');
  }, []);

  useEffect(() => {
    setFilterWord(debounce);
  }, [debounce]);

  useEffect(() => {
    onInputChange?.(filterWord);
  }, [filterWord, onInputChange]);

  return (
    <DropdownSearch
      wrapperClassName="asset-dropdown-wrapper"
      overlayClassName="empty-dropdown"
      open={openDrop}
      value={searchVal}
      inputProps={{
        onBlur: () => setOpenDrop(false),

        onChange: (e) => {
          const _value = e.target.value.replaceAll(' ', '');
          if (!_value) setOpenDrop(false);

          setSearchVal(_value);
        },
        placeholder,
      }}
    />
  );
}
