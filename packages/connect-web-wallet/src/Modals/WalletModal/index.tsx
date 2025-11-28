import { Drawer, Modal } from 'antd';
import { useModal } from '../../context/useModal';
import './index.less';
import WalletInner from '../../components/WalletInner';
import useMobile from '../../hooks/useMobile';
import { useMemo } from 'react';

export default function WalletModal() {
  const [{ dialogVisible }] = useModal();

  const isMobile = useMobile();

  const inner = useMemo(() => <WalletInner />, []);

  return isMobile ? (
    <Drawer
      className="portkey-connect-wallet-modal portkey-connect-wallet-drawer"
      placement="bottom"
      height={'95vh'}
      forceRender
      open={dialogVisible}>
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
      closable={false}>
      {inner}
    </Modal>
  );
}
