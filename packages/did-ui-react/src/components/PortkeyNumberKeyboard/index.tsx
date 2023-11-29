import { NumberKeyboard, NumberKeyboardProps } from 'antd-mobile';
import clsx from 'clsx';
import { PORTKEY_ROOT_ID } from '../../constants';
import './index.less';

export default function PortkeyNumberKeyboard({
  showCloseButton = false,
  getContainer,
  ...props
}: NumberKeyboardProps) {
  return (
    <NumberKeyboard
      {...props}
      showCloseButton={showCloseButton}
      getContainer={getContainer ? getContainer : () => document?.getElementById(PORTKEY_ROOT_ID) as any}
      className={clsx('portkey-ui-number-keyboard-wrapper', props.className)}
    />
  );
}
