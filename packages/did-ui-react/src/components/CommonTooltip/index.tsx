import BaseStyleProvider from '../BaseStyleProvider';
import CommonTooltipCom from './index.component';
import { TooltipProps } from 'antd';

export default function CommonTooltip(props?: TooltipProps) {
  return (
    <BaseStyleProvider>
      <CommonTooltipCom {...props} />
    </BaseStyleProvider>
  );
}
