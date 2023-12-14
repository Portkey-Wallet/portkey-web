import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { notificationPrefixCls } from './constants';
import { randomId } from '../../utils';
import { renderToString } from 'react-dom/server';
import { ReactElement } from 'react';
const portkeyNotification = { ...notification };

const methods = ['success', 'info', 'warning', 'error', 'open', 'warn'] as const;

const defaultNotificationArgs: Partial<ArgsProps> = {
  prefixCls: notificationPrefixCls,
};

function setDefaultArgs(originalArgs: ArgsProps, defaultArgs: Partial<ArgsProps> = {}): ArgsProps {
  const _originalArgs = { ...originalArgs };
  if (!_originalArgs.message) throw '';

  Object.keys(defaultArgs).forEach((v) => {
    const k = v as keyof ArgsProps;
    if (!_originalArgs[k]) _originalArgs[k] = defaultArgs[k] as any;
  });

  if (!_originalArgs.key) {
    let key = randomId();
    try {
      key =
        typeof _originalArgs.message === 'object'
          ? renderToString(_originalArgs.message as ReactElement)
          : _originalArgs.message.toString();
    } catch (error) {
      // key;
    }
    _originalArgs.key = key;
  }

  return _originalArgs;
}

methods.forEach((key) => {
  if (portkeyNotification[key]) {
    portkeyNotification[key] = (args: ArgsProps) => notification[key](setDefaultArgs(args, defaultNotificationArgs));
  }
});

export default portkeyNotification;
