'use client';
import {
  PortkeyStyleProvider,
  singleMessage,
  handleErrorMessage,
  CommonBaseModal,
  portkeyNotification,
  modalMethod,
  Drawer,
  PortkeyModal,
  ThrottleButton,
} from '@portkey/did-ui-react';
import { message, ConfigProvider, Modal, notification } from 'antd';
import { useState } from 'react';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import { Button } from 'antd';

ConfigProvider.config({
  prefixCls: 'ant',
});

export default function UI() {
  const [openModal, setOpenModal] = useState<boolean>();
  const [antModal, setAntModal] = useState<boolean>();
  console.log(openModal, 'openModal===');
  return (
    <div>
      <ExclamationCircleOutlined />
      <div>-----</div>
      <Button
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
      </Button>
      <Button
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
      </Button>
      <ConfigProvider prefixCls="ant">
        <Button
          onClick={() => {
            message.open({ content: 'prefixCls: open' });

            message.error({ content: 'prefixCls: message', rootPrefixCls: 'portkey-ant-message', duration: 10 });
          }}>
          message
        </Button>
        <div>--------</div>

        <Button
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
        </Button>

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
          <Button
            onClick={() => {
              singleMessage.error('afterOpenChange message');
            }}>
            btn
          </Button>
        </PortkeyModal>

        <PortkeyStyleProvider>
          <Button
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
          </Button>

          <div>--------</div>

          <Button
            onClick={() => {
              singleMessage.success({ content: 1 }, 1000);

              singleMessage.success('112333');

              singleMessage.error({
                content: 'prefixCls: message',
                rootPrefixCls: 'portkey-ant-message',
                duration: 100,
              });
            }}>
            singleMessage
          </Button>
          <div>--------</div>

          <Button
            onClick={() => {
              setAntModal(true);
            }}>
            antd Modal
          </Button>

          <Button
            onClick={() => {
              setOpenModal(true);
            }}>
            portkey Modal
          </Button>
          <Button
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
          </Button>
          <div>---</div>

          <ThrottleButton
            onClick={() => {
              console.log('ThrottleButton====');
            }}>
            ThrottleButton
          </ThrottleButton>
        </PortkeyStyleProvider>
      </ConfigProvider>
    </div>
  );
}
