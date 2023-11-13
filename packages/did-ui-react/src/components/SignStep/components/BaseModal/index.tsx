import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import './index.less';
import { PORTKEY_PREFIX_CLS } from '../../../../constants';

export default function BaseModal(props: ModalProps) {
  const { transitionName } = props;
  return (
    <Modal
      closable={false}
      centered
      destroyOnClose
      title={null}
      footer={null}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      {...props}
      width={props.width ?? 430}
      prefixCls={`${PORTKEY_PREFIX_CLS}-modal`}
      className={clsx('portkey-ui-base-modal', props.className)}
      transitionName={transitionName}
    />
  );
}
