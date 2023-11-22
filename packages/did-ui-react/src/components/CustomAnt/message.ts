import { PORTKEY_PREFIX_CLS } from '../../constants';
import { messagePrefixCls } from './constants';
import message, { ArgsProps, MessageApi, MessageInstance, typeList } from './antd/message';
import { randomId } from '../../utils';
import { renderToString } from 'react-dom/server';

const singleMessage = {} as Omit<MessageApi, 'useMessage'>;

const defaultMessageArgs: Partial<ArgsProps> = {
  prefixCls: messagePrefixCls,
  rootPrefixCls: PORTKEY_PREFIX_CLS,
  getPopupContainer: () => document.getElementById('portkey-ui-root') || document.getElementsByName('body')[0],
};

function isArgsProps(content: Parameters<MessageInstance['success']>[0]): content is ArgsProps {
  return Object.prototype.toString.call(content) === '[object Object]' && !!(content as ArgsProps).content;
}

function setDefaultArgs(originalArgs: ArgsProps, defaultArgs: Partial<ArgsProps> = {}): ArgsProps {
  const _originalArgs = { ...originalArgs };
  if (!_originalArgs.content) throw '';

  Object.keys(defaultArgs).forEach((v) => {
    const k = v as keyof ArgsProps;
    if (!_originalArgs[k]) _originalArgs[k] = defaultArgs[k];
  });

  if (!_originalArgs.key) {
    let key = randomId();
    try {
      key = typeof _originalArgs.content === 'object' ? renderToString(_originalArgs.content) : _originalArgs.content;
    } catch (error) {
      // key;
    }
    _originalArgs.key = key;
  }

  return _originalArgs;
}

typeList.forEach((type) => {
  singleMessage[type] = (...params) => {
    const _content = params[0];
    const content = isArgsProps(_content)
      ? _content
      : {
          content: _content,
        };
    message.destroy(content.content as any);

    return message[type](setDefaultArgs(content, defaultMessageArgs), params[1], params[2]);
  };
});

singleMessage.open = (args) => message.open(setDefaultArgs(args, defaultMessageArgs));
singleMessage.destroy = message.destroy;
singleMessage.warn = singleMessage.warning;
singleMessage.config = (options) =>
  message.config({ ...options, prefixCls: options.prefixCls || defaultMessageArgs.prefixCls });

export default singleMessage;
