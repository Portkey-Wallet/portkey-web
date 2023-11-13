import { ConfigProvider } from 'antd';
import React from 'react';

export default function PortkeyStyleProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider prefixCls="portkey-ant">{children}</ConfigProvider>;
}
