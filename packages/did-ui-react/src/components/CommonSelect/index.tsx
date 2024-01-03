import { Select, SelectProps } from 'antd';
import clsx from 'clsx';
import { ReactNode, useMemo } from 'react';
import { DefaultOptionType } from 'antd/lib/select';
import './index.less';

export interface CommonSelectProps extends SelectProps {
  items?: { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }[];
  customOptions?: DefaultOptionType[];
}

export default function CommonSelect({ items, className, customOptions, ...props }: CommonSelectProps) {
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

  return (
    <Select
      className={clsx('portkey-ui-common-select', className)}
      showArrow={false}
      getPopupContainer={(triggerNode) => triggerNode.parentElement}
      style={{ width: '100%' }}
      options={combineOptions}
      {...props}
    />
  );
}
