import CommonTooltipCom from './index.component';
import { TooltipProps } from 'antd';
import { BaseConfigProvider } from '../config-provider';

export default function CommonTooltip(props?: TooltipProps) {
  return (
    <BaseConfigProvider>
      <CommonTooltipCom {...props} />
    </BaseConfigProvider>
  );
}
