import { Select, SelectProps } from 'antd';
import clsx from 'clsx';
import { ReactNode, useMemo } from 'react';
import './index.less';

export interface CommonSelectProps extends SelectProps {
  items?: { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }[];
}

export default function CommonSelect({ items, className, ...props }: CommonSelectProps) {
  const selectOptions = useMemo(
    () =>
      items?.map((item) => ({
        value: item.value,
        disabled: item.disabled,
        label: (
          <div className="flex-row-center label-item">
            <div className="label-icon">{item.icon}</div>
            <div className="title">{item.label}</div>
          </div>
        ),
      })),
    [items],
  );

  return (
    <Select
      className={clsx('portkey-ui-common-select', className)}
      showArrow={false}
      getPopupContainer={(triggerNode) => triggerNode.parentElement}
      style={{ width: '100%' }}
      options={selectOptions}
      {...props}
    />
  );
}
