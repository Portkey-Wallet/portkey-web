import { Modal, Select, SelectProps } from 'antd';
import clsx from 'clsx';
import { ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';
import { DefaultOptionType } from 'antd/lib/select';
import './index.less';
import CustomSvg from '../CustomSvg';
import CommonBaseModal from '../CommonBaseModal';

export interface CommonSelectProps extends SelectProps {
  items?: { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }[];
  customOptions?: DefaultOptionType[];
}

export default function CommonSelect({
  items,
  className,
  customOptions,
  value,
  onChange,
  ...props
}: CommonSelectProps) {
  const selectOptions = useMemo(
    () =>
      items?.map((item) => ({
        value: item.value,
        disabled: item.disabled,
        label: (
          <div className="portkey-ui-flex-row-center label-item">
            <div className="label-icon">{item.icon}</div>
            <div className="title">{item.label}</div>
          </div>
        ),
      })),
    [items],
  );

  const combineOptions = useMemo(
    () => [...(selectOptions || []), ...(customOptions || [])],
    [customOptions, selectOptions],
  );
  const [showList, setShowList] = useState(false);

  const [select, setSelect] = useState<DefaultOptionType>();

  const [selectValue, setSelectValue] = useState();

  useEffect(() => {
    setSelectValue(value);
    const selected = combineOptions.filter((list) => list.value == value)[0];
    setSelect(selected);
  }, [value, combineOptions]);

  const selectOption = (option: any) => {
    setSelect(option);
    setShowList(false);
    if (onChange) {
      onChange(option.value, option);
    }
  };

  return (
    <>
      <div className={clsx('portkey-ui-common-select-new', className)} onClick={() => setShowList(true)}>
        <div>{select?.label || props.placeholder}</div>
        {!props.disabled && (
          <CustomSvg
            className="portkey-ui-account-arrow"
            fillColor="var(--sds-color-icon-default-default)"
            type="KeyboardArrowDown"
          />
        )}
      </div>
      {showList && (
        <CommonBaseModal className="select-modal" title={props.placeholder} open={showList}>
          <CustomSvg
            className="select-close"
            type="Select-close"
            strokeColor="var(--sds-color-icon-default-default)"
            onClick={() => setShowList(false)}
          />

          <div className="select-lists">
            {combineOptions.map((list, index) => {
              return (
                <div
                  className={`select-list ${list.disabled ? 'disabled' : ''}`}
                  key={index}
                  onClick={() => {
                    if (!list.disabled) {
                      selectOption(list);
                    }
                  }}>
                  <div className="select-label">
                    <span>{list.label}</span>
                    {selectValue == list.value && <span className="current">Current</span>}
                  </div>
                  {selectValue == list.value && (
                    <CustomSvg
                      className="selected-icon"
                      fillColor="var(--sds-color-icon-brand-secondary)"
                      type="SelectedList"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CommonBaseModal>
      )}
    </>
    // <Select
    //   className={clsx('portkey-ui-common-select', className)}
    //   showArrow={false}
    //   getPopupContainer={(triggerNode) => triggerNode.parentElement}
    //   style={{ width: '100%' }}
    //   options={combineOptions}
    //   {...props}
    // />
  );
}
