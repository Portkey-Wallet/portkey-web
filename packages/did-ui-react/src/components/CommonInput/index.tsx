import { useMemo } from 'react';
import clsx from 'clsx';
import { Input, InputProps } from 'antd';
import CustomSvg from '../CustomSvg';
import './index.less';

function CommonInputSearch({ className, ...props }: InputProps) {
  const suffix = useMemo(() => {
    if (props.value) {
      if (props.disabled) {
        return <CustomSvg type="Close" />;
      }
      return <CustomSvg type="Close3" />;
    }
    return <CustomSvg type="SearchBlur" />;
  }, [props.value, props.disabled]);

  return <Input {...props} className={clsx('portkey-ui-common-input-search', className)} suffix={suffix} />;
}

export default function CommonInput(props: InputProps) {
  if (props.type === 'search') {
    return <CommonInputSearch {...props} />;
  }
  return <Input {...props} />;
}
