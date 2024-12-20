import { useMemo } from 'react';
import clsx from 'clsx';
import { Input, InputProps } from 'antd';
import CustomSvg from '../CustomSvg';
import './index.less';

function CommonInputSearch({ className, onClear, ...props }: InputProps & { onClear?: () => void }) {
  const suffix = useMemo(() => {
    if (props.value) {
      if (props.disabled) {
        return <CustomSvg type="Close" onClick={onClear} />;
      }
      return <CustomSvg type="Close3" onClick={onClear} />;
    }
    return <CustomSvg type="SearchBlur" onClick={onClear} />;
  }, [props.value, props.disabled, onClear]);

  return <Input {...props} className={clsx('portkey-ui-common-input-search', className)} suffix={suffix} />;
}

export default function CommonInput(props: InputProps & { onClear?: () => void }) {
  if (props.type === 'search') {
    return <CommonInputSearch {...props} />;
  }
  return <Input {...props} />;
}
