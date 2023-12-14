import { Input } from 'antd';
import { useState } from 'react';
import SuffixSelect from '../SuffixSelect';
import CustomSvg from '../../../CustomSvg';
import { FiatType, IKeyDownParams, PartialFiatType, RampDrawerType } from '../../../../types';

export interface ICurToken {
  crypto: string;
  network: string;
}

export interface ITokenInputProps {
  value: string;
  fiatList: FiatType[];
  onChange: (val: string) => void;
  readOnly: boolean;
  onKeyDown: (e: IKeyDownParams) => void;
  curToken: ICurToken;
  onSelect: (v: PartialFiatType) => void;
}

export default function TokenInput({
  value,
  fiatList,
  onChange,
  readOnly,
  onKeyDown,
  curToken,
  onSelect,
}: ITokenInputProps) {
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
            <CustomSvg type="AelfTestnet" />
            <div className="currency">{curToken.crypto}</div>
            <CustomSvg type="Down" />
          </div>
        }
      />
      <SuffixSelect
        fiatList={fiatList}
        drawerType={RampDrawerType.TOKEN}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSelect={onSelect}
      />
    </>
  );
}
