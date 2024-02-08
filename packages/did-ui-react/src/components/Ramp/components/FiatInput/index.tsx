import { Input } from 'antd';
import { useState } from 'react';
import SelectFiatListWrap from '../SelectList/SelectFiatListWrap';
import { IKeyDownParams } from '../../../../types';
import CustomSvg from '../../../CustomSvg';
import { IRampCryptoDefault, IRampFiatItem } from '@portkey/ramp';

export interface IFiatInputProps {
  value: string;
  curFiat: IRampFiatItem;
  readOnly: boolean;
  defaultCrypto: IRampCryptoDefault;
  supportList: IRampFiatItem[];
  onChange?: (val: string) => void;
  onKeyDown: (e: IKeyDownParams) => void;
  onSelect: (v: IRampFiatItem) => void;
}

const SelectFiat = 'Select Currency';
const SearchFiat = 'Search currency';
export default function FiatInput({
  value,
  curFiat,
  readOnly,
  defaultCrypto,
  supportList,
  onChange,
  onKeyDown,
  onSelect,
}: IFiatInputProps) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <>
      <Input
        value={value}
        autoComplete="off"
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        suffix={
          <div className="portkey-ui-flex-center" onClick={() => setOpenDrawer(true)}>
            <div className="img">
              <img src={curFiat.icon} />
            </div>
            <div className="currency">{curFiat.symbol}</div>
            <CustomSvg type="Down" />
          </div>
        }
      />
      <SelectFiatListWrap
        title={SelectFiat}
        searchPlaceHolder={SearchFiat}
        defaultCrypto={defaultCrypto}
        supportList={supportList}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onChange={onSelect}
      />
    </>
  );
}
