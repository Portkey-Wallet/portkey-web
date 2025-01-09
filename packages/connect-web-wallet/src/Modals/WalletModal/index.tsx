import { Drawer, Modal } from 'antd';
import { basicModalView } from '../../context/useModal/actions';
import { useModal } from '../../context/useModal';
import './index.less';
import WalletInner from '../../components/WalletInner';
import useMobile from '../../hooks/useMobile';
import { useMemo } from 'react';

export default function WalletModal() {
  const [{ dialogVisible }, { dispatch }] = useModal();

  const closeModal = () => dispatch(basicModalView.setWalletDialog.actions(false));
  console.log(dialogVisible, 'dialogVisible==');

  const isMobile = useMobile();

  const inner = useMemo(() => <WalletInner />, []);

  return isMobile ? (
    <Drawer placement="bottom" height={'70vh'} forceRender open={dialogVisible}>
      {inner}
    </Drawer>
  ) : (
    <Modal
      prefixCls="portkey-connect-modal"
      className="portkey-connect-wallet-modal"
      wrapClassName="portkey-connect-wallet-modal-wrapper"
      forceRender
      open={dialogVisible}
      style={{ height: 700 }}
      footer={null}
      closable={false}
      // onCancel={closeModal}
    >
      {inner}
    </Modal>
  );
}
