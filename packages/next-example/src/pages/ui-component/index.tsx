import {
  PortkeyStyleProvider,
  singleMessage,
  handleErrorMessage,
  CommonBaseModal,
  portkeyNotification,
  modalMethod,
  Drawer,
  PortkeyModal,
  PhoneNumberInput,
} from '@portkey-v1/did-ui-react';
import { message, ConfigProvider, Modal, notification } from 'antd';
import { useState } from 'react';

ConfigProvider.config({
  prefixCls: 'ant',
});

export default function UI() {
  const [openModal, setOpenModal] = useState<boolean>();
  const [antModal, setAntModal] = useState<boolean>();
  console.log(openModal, 'openModal===');
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
            singleMessage.error(handleErrorMessage(error));
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
            singleMessage.error(handleErrorMessage(error));
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

        {/* <CommonBaseModal
          prefixCls="portkey-ant-modal"
          open={openModal}
          closable
          afterClose={() => {
            console.log(openModal, 'afterClose afterOpenChange');
          }}
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
        </CommonBaseModal> */}

        {/* <Drawer
          title="Basic Drawer"
          placement={'bottom'}
          height={300}
          closable={false}
          onClose={() => setOpenModal(false)}
          afterOpenChange={open => {
            console.log(open, openModal, 'afterOpenChange=--');
          }}
          open={openModal}
          key={'placement'}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer> */}

        <PortkeyModal
          // type="drawer"
          height={800}
          placement={'bottom'}
          open={openModal}
          title="PORTKEY MODAL"
          onClose={() => setOpenModal(false)}
          footer={null}
          afterOpenChange={open => {
            console.log(open, openModal, 'afterOpenChange=PortkeyModal');
          }}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <button
            onClick={() => {
              singleMessage.error('afterOpenChange message');
            }}>
            btn
          </button>
        </PortkeyModal>

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
          <button
            onClick={async () => {
              const isOk = await modalMethod({
                wrapClassName: 'verify-confirm-modal',
                type: 'confirm',
                content: (
                  <p className="modal-content">
                    {` will send a verification code to `}
                    <span className="bold">{'identifier'}</span>
                    {` to verify your ${'accountType'} address.`}
                  </p>
                ),
              });
            }}>
            modalMethod
          </button>
        </PortkeyStyleProvider>
      </ConfigProvider>
    </div>
  );
}
