import { NumberKeyboard, NumberKeyboardProps } from 'antd-mobile';
import clsx from 'clsx';
import './index.less';

export default function PortkeyNumberKeyboard(props: NumberKeyboardProps) {
  return <NumberKeyboard {...props} className={clsx('portkey-ui-number-keyboard-wrapper', props.className)} />;
}
