import {
  PortkeyStyleProvider,
  singleMessage,
  handleErrorMessage,
  CommonBaseModal,
  portkeyNotification,
} from '@portkey/did-ui-react';
import { message, ConfigProvider, Modal, notification } from 'antd';
import { useState } from 'react';

ConfigProvider.config({
  prefixCls: 'ant',
});

export default function UI() {
  const [openModal, setOpenModal] = useState<boolean>();
  const [antModal, setAntModal] = useState<boolean>();

  return (
    <div>
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
      <ConfigProvider prefixCls="ant">
        <button
          onClick={() => {
            message.open({ content: 'prefixCls: open' });

            message.error({ content: 'prefixCls: message', rootPrefixCls: 'portkey-ant-message', duration: 10 });
          }}>
          message
        </button>
        <div>--------</div>

        <button
          onClick={() => {
            notification.open({
              message: 'Notification Title',
              description:
                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
              onClick: () => {
                console.log('Notification Clicked!');
              },
            });
          }}>
          notification
        </button>

        <div>--------</div>

        <Modal open={antModal} closable onCancel={() => setAntModal(false)}>
          <div>--------</div>
          <div>--------</div>
          <div>--------</div>
          antd Modal
          <div>--------</div>
          <div>--------</div>
          <div>--------</div>
        </Modal>
        <div>--------</div>

        <PortkeyStyleProvider>
          <button
            onClick={() => {
              portkeyNotification.open({
                message: 'Notification Title',
                description:
                  'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
                onClick: () => {
                  console.log('Notification Clicked!');
                },
              });
            }}>
            portkey notification
          </button>

          <div>--------</div>

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
          <div>--------</div>

          <button
            onClick={() => {
              setAntModal(true);
            }}>
            antd Modal
          </button>

          <button
            onClick={() => {
              setOpenModal(true);
            }}>
            portkey Modal
          </button>
          <CommonBaseModal
            prefixCls="portkey-ant-modal"
            open={openModal}
            closable
            onCancel={() => {
              console.log('onCancel===', openModal);
              setOpenModal(false);
            }}>
            <div>--------</div>
            <div>--------</div>
            <div>--------</div>
            CommonBaseModal
            <div>--------</div>
            <div>--------</div>
            <div>--------</div>
          </CommonBaseModal>
        </PortkeyStyleProvider>
      </ConfigProvider>
    </div>
  );
}
