import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CommonTooltipCom from './index.component';
import { TooltipProps } from 'antd';

export default function CommonTooltip(props?: TooltipProps) {
  return (
    <PortkeyStyleProvider>
      <CommonTooltipCom {...props} />
    </PortkeyStyleProvider>
  );
}
