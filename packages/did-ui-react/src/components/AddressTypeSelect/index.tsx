import React, { useMemo } from 'react';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import './index.less';

export enum AddressTypeEnum {
  EXCHANGE = 'exchange',
  NON_EXCHANGE = 'non-exchange',
}

interface IAddressTypeSelectProps {
  value: AddressTypeEnum;
  onChangeValue: (v: AddressTypeEnum) => void;
}

export const AddressTypeSelect: React.FC<IAddressTypeSelectProps> = (props) => {
  const { value, onChangeValue } = props;

  const selectedIcon = useMemo(() => {
    return <CustomSvg fillColor="var(--sds-color-icon-brand-secondary)" type="CheckCircle" className="selected-svg" />;
  }, []);

  return (
    <div className="address-type-select-wrap">
      <div
        className={clsx(['item-wrap', { 'selected-item': value === AddressTypeEnum.EXCHANGE }])}
        onClick={() => onChangeValue(AddressTypeEnum.EXCHANGE)}>
        <div className="left-section">
          <span>Yes, send to an exchange</span>
          <CustomSvg type="ExchangesList" className="exchange-list" />
        </div>
        {value === AddressTypeEnum.EXCHANGE && <div className="selected-wrap">{selectedIcon}</div>}
      </div>
      <div className="gap" />
      <div
        className={clsx(['item-wrap', { 'selected-item': value === AddressTypeEnum.NON_EXCHANGE }])}
        onClick={() => onChangeValue(AddressTypeEnum.NON_EXCHANGE)}>
        <span className="left-section">{`No, it's a non-exchange address`}</span>
        {value === AddressTypeEnum.NON_EXCHANGE && <div className="selected-wrap">{selectedIcon}</div>}
      </div>
    </div>
  );
};

export default AddressTypeSelect;
