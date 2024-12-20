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

  console.log('combineOptions', combineOptions, props);
  const [select, setSelect] = useState<DefaultOptionType>(combineOptions[0]);

  const [selectValue, setSelectValue] = useState(combineOptions[0].value);

  useEffect(() => {
    setSelectValue(value);
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(combineOptions[0].value, combineOptions[0]);
    }
  }, [combineOptions]);

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
        <div>{select?.label || combineOptions[0].label}</div>
        <CustomSvg
          className="portkey-ui-account-arrow"
          fillColor="var(--sds-color-icon-default-default)"
          type="KeyboardArrowDown"
        />
      </div>
      {showList && (
        <CommonBaseModal className="select-modal" title={props.placeholder} open={showList}>
          <CustomSvg
            className="select-close"
            fillColor="var(--sds-color-icon-default-default)"
            type="Close"
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
                  {list.label}
                  {selectValue == list.value && <CustomSvg className="selected-icon" type="SelectedList" />}
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
