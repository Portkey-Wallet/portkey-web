import { Input } from 'antd';
import clsx from 'clsx';
import { useState, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { CountryItem } from '../../types';
import AreaCode from '../AreaCode';
import CustomSvg from '../CustomSvg';
import { IPhoneCountry } from '../types';
import './index.less';

interface PhoneNumberInputProps {
  iso?: IPhoneCountry['iso'];
  countryList?: IPhoneCountry['countryList'];
  phoneNumber?: string;
  onAreaChange?: (v: CountryItem) => void;
  onPhoneNumberChange?: (v: string) => void;
  onCancel?: () => void;
}

export default function PhoneNumberInput({
  iso,
  countryList,
  phoneNumber,
  onAreaChange,
  onCancel,
  onPhoneNumberChange,
}: PhoneNumberInputProps) {
  const [open, setOpen] = useState<boolean>();
  const currentArea = useMemo(() => countryList?.find((v) => v.iso === iso), [iso, countryList]);
  useEffectOnce(() => {
    currentArea && onAreaChange?.(currentArea);
  });

  return (
    <div className="phone-number-input-wrapper">
      <div className="flex phone-number-input">
        <div className="addon-content">
          <div
            className="flex-between-center input-addon"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}>
            <div>{currentArea?.code ? `+ ${currentArea.code}` : '--'}</div>
            <CustomSvg className={clsx('input-arrow', open && 'open-input-arrow')} type="BackLeft" />
          </div>
        </div>

        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange?.(e.target.value)}
        />
      </div>
      <AreaCode
        open={open}
        value={iso}
        areaList={countryList}
        onCancel={() => {
          onCancel?.();
          setOpen(false);
        }}
        onChange={(CountryItem) => {
          onAreaChange?.(CountryItem);
          setOpen(false);
        }}
      />
    </div>
  );
}
