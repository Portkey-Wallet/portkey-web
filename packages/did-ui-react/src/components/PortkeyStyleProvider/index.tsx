import { ConfigProvider } from 'antd';
import React from 'react';
import { useEffectOnce } from 'react-use';
import { PORTKEY_PREFIX_CLS } from '../../constants';

export default function PortkeyStyleProvider({ children }: { children: React.ReactNode }) {
  useEffectOnce(() => {
    ConfigProvider.config({
      prefixCls: PORTKEY_PREFIX_CLS,
    });
  });
  return <ConfigProvider prefixCls="portkey-ant">{children}</ConfigProvider>;
}
