import React from 'react';
import { ConfigProvider } from 'antd';
export default function StyleConfigProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider prefixCls="portkey-connect">{children}</ConfigProvider>;
}
