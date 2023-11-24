import { ConfigProvider } from 'antd';
import { PORTKEY_PREFIX_CLS } from '../../constants';

export default function PortkeyStyleProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider prefixCls={PORTKEY_PREFIX_CLS}>{children}</ConfigProvider>;
}
