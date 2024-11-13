import { useMemo } from 'react';
import { PASSWORD_LENGTH } from '../../constants/misc';
import clsx from 'clsx';
import PortkeyBaseNumberKeyboard from '../PortkeyBaseNumberKeyboard';
import './index.less';

interface PortkeyPasswordInputProps {
  value?: string;
  length?: number;
  error?: string;
  onChange?: (val: string) => void;
  onFill?: (val: string) => void;
  footer?: React.ReactNode;
}

export default function PortkeyPasswordInput({
  value = '',
  length = PASSWORD_LENGTH,
  error,
  onFill,
  onChange,
  footer,
}: PortkeyPasswordInputProps) {
  const valueLength = useMemo(() => value.length, [value.length]);

  return (
    <div className="portkey-ui-password-input-wrapper">
      <div className="portkey-ui-passcode-cell-wrapper">
        {new Array(length).fill('').map((_, index) => (
          <div
            key={index}
            className={clsx(
              'portkey-ui-passcode-cell',
              index + 1 <= valueLength && 'portkey-ui-passcode-cell-dot',
            )}></div>
        ))}
      </div>
      <div className="passcode-error-tip">{error}</div>
      <PortkeyBaseNumberKeyboard
        header={footer && <div className="footer-wrapper">{footer}</div>}
        onInput={(v) => {
          if (value.length === length) return;
          if (value.length < length) {
            const val = (value + v).slice(0, length);
            onChange?.(val);
            if (val.length === length) onFill?.(val);
          }
        }}
        onDelete={() => {
          onChange?.(value.slice(0, -1));
        }}
      />
    </div>
  );
}
