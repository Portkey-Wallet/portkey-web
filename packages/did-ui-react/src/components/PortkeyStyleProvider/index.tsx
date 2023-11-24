import { ConfigProvider } from 'antd';
import React from 'react';
import { useEffectOnce } from 'react-use';

export default function PortkeyStyleProvider({ children }: { children: React.ReactNode }) {
  useEffectOnce(() => {
    ConfigProvider.config({
      prefixCls: 'portkey-ant',
    });
  });
  return <ConfigProvider prefixCls="portkey-ant">{children}</ConfigProvider>;
}
