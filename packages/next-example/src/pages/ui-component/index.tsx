import { PortkeyStyleProvider, singleMessage, handleErrorMessage } from '@portkey/did-ui-react';
import { message, ConfigProvider } from 'antd';
import React from 'react';

export default function UI() {
  return (
    <div>
      {' '}
      <div>-----</div>
      <button
        onClick={async () => {
          try {
            ConfigProvider.config({
              prefixCls: 'portkey-ant',
            });
          } catch (error) {
            message.error(handleErrorMessage(error));
          }
        }}>
        prefixCls: portkey-ant
      </button>
      <button
        onClick={async () => {
          try {
            ConfigProvider.config({
              prefixCls: 'ant',
            });
          } catch (error) {
            message.error(handleErrorMessage(error));
          }
        }}>
        prefixCls: ant
      </button>
      <ConfigProvider>
        <button
          onClick={() => {
            message.open({ content: 'prefixCls: open' });

            message.error({ content: 'prefixCls: message', rootPrefixCls: 'portkey-ant-message', duration: 10 });
          }}>
          message
        </button>

        <div></div>
        <PortkeyStyleProvider>
          <button
            onClick={() => {
              singleMessage.open({ content: 1 });
              singleMessage.success({ content: 1 });

              singleMessage.success('112333');

              singleMessage.error({
                content: 'prefixCls: message',
                rootPrefixCls: 'portkey-ant-message',
                duration: 10,
              });
            }}>
            singleMessage
          </button>
        </PortkeyStyleProvider>
      </ConfigProvider>
    </div>
  );
}
