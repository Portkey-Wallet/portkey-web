import { Input } from 'antd';
import { PasswordProps } from 'antd/lib/input';
import CustomSvg from '../CustomSvg';
import React, { useCallback } from 'react';

const { Password } = Input;

export default function CustomPassword({ maxLength, placeholder, iconRender, ...props }: PasswordProps) {
  const defaultIconRender = useCallback(
    (visible: boolean) =>
      visible ? (
        <CustomSvg style={{ cursor: 'pointer' }} type="EyeOutlined" />
      ) : (
        <CustomSvg style={{ cursor: 'pointer' }} type="EyeInvisibleOutlined" />
      ),
    [],
  );

  return (
    <Password
      {...props}
      maxLength={maxLength ?? 16}
      placeholder={placeholder ?? 'Must be at least 8 characters'}
      iconRender={iconRender ?? defaultIconRender}
    />
  );
}
