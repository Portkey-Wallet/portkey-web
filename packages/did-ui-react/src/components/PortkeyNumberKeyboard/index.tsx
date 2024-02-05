import { NumberKeyboard, NumberKeyboardProps } from 'antd-mobile';
import clsx from 'clsx';
import './index.less';

export default function PortkeyNumberKeyboard({ showCloseButton = false, ...props }: NumberKeyboardProps) {
  return (
    <NumberKeyboard
      {...props}
      showCloseButton={showCloseButton}
      className={clsx('portkey-ui-number-keyboard-wrapper', props.className)}
    />
  );
}
