import clsx from 'clsx';
import { shuffle } from './shuffle';
import { useCallback, useMemo } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { SafeArea } from 'antd-mobile';
import CustomSvg from '../CustomSvg';
import './index.less';

const classPrefix = 'portkey-ui-base-number-keyboard';

interface Props {
  customKey?: string | [string, string];
  randomOrder?: boolean;
  onInput?: (v: string) => void;
  onDelete?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  closeOnConfirm?: boolean;
  safeArea?: boolean;
  header?: React.ReactNode;
}

export default function PortkeyBaseNumberKeyboard({
  randomOrder = false,
  closeOnConfirm = true,
  customKey,
  safeArea = true,
  onInput,
  onDelete,
  onClose,
  onConfirm,
  header,
}: Props) {
  const keys = useMemo(() => {
    const defaultKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const keyList = randomOrder ? shuffle(defaultKeys) : defaultKeys;
    const customKeys = Array.isArray(customKey) ? customKey : [customKey];
    keyList.push('0');

    keyList.splice(9, 0, customKeys[0] || '');
    keyList.push(customKeys[1] || 'BACKSPACE');
    return keyList;
  }, [customKey, randomOrder]);

  const onKeyPress = useCallback(
    (e: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, key: string) => {
      e.preventDefault();

      switch (key) {
        case 'BACKSPACE':
          onDelete?.();
          break;
        case 'OK':
          onConfirm?.();
          if (closeOnConfirm) {
            onClose?.();
          }
          break;
        default:
          // onInput should't be called when customKey doesn't exist
          if (key !== '') onInput?.(key);
          break;
      }
    },
    [closeOnConfirm, onClose, onConfirm, onDelete, onInput],
  );

  const renderKey = useCallback(
    (key: string) => {
      const isNumberKey = /^\d$/.test(key);
      const className = clsx(`${classPrefix}-key`, {
        [`${classPrefix}-key-number`]: isNumberKey,
        [`${classPrefix}-key-sign`]: !isNumberKey && key,
      });

      const ariaProps = key
        ? {
            role: 'grid',
            title: key,
            tabIndex: -1,
          }
        : undefined;

      return (
        <div
          key={key}
          className={className}
          onTouchEnd={(e) => {
            onKeyPress(e, key);
            if (key === 'BACKSPACE') {
              onDelete?.();
            }
          }}
          {...ariaProps}>
          {key === 'BACKSPACE' ? <CustomSvg type="Backspace" /> : key}
        </div>
      );
    },
    [onDelete, onKeyPress],
  );

  return (
    <div className={clsx(`${classPrefix}-wrapper`)}>
      {header}
      <div className={clsx(`${classPrefix}-bg-wrapper`)}>
        <div className={`${classPrefix}-inner-wrapper`}>
          <div className={clsx(`${classPrefix}-main`)}>{keys.map(renderKey)}</div>
        </div>
        {safeArea && (
          <div className={`${classPrefix}-footer`}>
            <SafeArea position="bottom" />
          </div>
        )}
      </div>
    </div>
  );
}
