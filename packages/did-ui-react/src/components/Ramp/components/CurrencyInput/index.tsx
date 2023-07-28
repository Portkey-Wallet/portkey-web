import { Input } from 'antd';
import { useState } from 'react';
import SuffixSelect from '../SuffixSelect';
import { RampTypeEnum, RampDrawerType, IKeyDownParams, PartialFiatType } from '../../../../types';
import CustomSvg from '../../../CustomSvg';
import { countryCodeMap } from '../../../../constants/ramp';

export interface ICurrencyInputProps {
  value: string;
  side: RampTypeEnum;
  onChange: (val: string) => void;
  readOnly: boolean;
  onKeyDown: (e: IKeyDownParams) => void;
  curFiat: PartialFiatType;
  onSelect: (v: PartialFiatType) => void;
}

export default function CurrencyInput({
  value,
  side,
  onChange,
  readOnly,
  onKeyDown,
  curFiat,
  onSelect,
}: ICurrencyInputProps) {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <>
      <Input
        value={value}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        suffix={
          <div className="portkey-ui-flex-center" onClick={() => setOpenDrawer(true)}>
            <div className="img">
              <img src={countryCodeMap[curFiat.country || '']?.icon} alt="" />
            </div>
            <div className="currency">{curFiat.currency}</div>
            <CustomSvg type="Down" />
          </div>
        }
      />
      <SuffixSelect
        drawerType={RampDrawerType.CURRENCY}
        side={side}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSelect={onSelect}
        isModal={false}
      />
    </>
  );
}
