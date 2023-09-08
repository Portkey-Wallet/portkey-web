import { Switch, SwitchProps } from 'antd';
import './index.less';

interface ISwitchComponentProps extends SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  text?: string;
}

export default function SwitchComponent({
  checked = true,
  text = '',
  disabled = false,
  ...props
}: ISwitchComponentProps) {
  return (
    <div className="portkey-ui-flex-start-center portkey-ui-switch-component">
      <Switch checked={checked} disabled={disabled} {...props} />
      <div className="portkey-ui-switch-text">{text}</div>
    </div>
  );
}
