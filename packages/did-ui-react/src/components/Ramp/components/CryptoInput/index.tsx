import { Input } from 'antd';
import { useState } from 'react';
import SelectCryptoListWrap from '../SelectList/SelectCryptoListWrap';
import CustomSvg from '../../../CustomSvg';
import { IKeyDownParams, NetworkType } from '../../../../types';
import { IRampCryptoItem } from '@portkey/ramp';

export interface ICryptoInputProps {
  networkType: NetworkType;
  value: string;
  curCrypto: IRampCryptoItem;
  readOnly: boolean;
  supportList: IRampCryptoItem[];
  onChange?: (val: string) => void;
  onKeyDown: (e: IKeyDownParams) => void;
  onSelect: (v: IRampCryptoItem) => void;
}

const SelectCrypto = 'Select Crypto';
const SearchCrypto = 'Search crypto';

export default function CryptoInput({
  networkType,
  value,
  curCrypto,
  readOnly,
  supportList,
  onChange,
  onKeyDown,
  onSelect,
}: ICryptoInputProps) {
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
              <img src={curCrypto.icon} />
            </div>
            <div className="currency">{curCrypto.symbol}</div>
            <CustomSvg type="Down" />
          </div>
        }
      />
      <SelectCryptoListWrap
        networkType={networkType}
        title={SelectCrypto}
        searchPlaceHolder={SearchCrypto}
        open={openDrawer}
        supportList={supportList}
        onClose={() => setOpenDrawer(false)}
        onChange={onSelect}
      />
    </>
  );
}
