import BaseModalFunc from '../BaseModalMethod';
import { did } from '../../../utils';
import SecurityCheck from '../../SecurityCheck';
import CustomModal from '../../CustomModal';
import { ChainId } from '@portkey/types';

interface WalletSecurityCheckModalProps extends AddGuardiansModalProps {
  caHash: string;
  originChainId: ChainId;
  targetChainId?: ChainId;
}

interface AddGuardiansModalProps {
  wrapClassName?: string;
  className?: string;
  onOk?: () => void;
}

const walletSecurityCheck = async ({
  wrapClassName,
  className,
  caHash,
  originChainId,
  targetChainId,
  onOk,
  ...props
}: WalletSecurityCheckModalProps) => {
  const res = await did.services.security.getWalletBalanceCheck({ caHash });

  // don’t know the chain of operations
  if (!targetChainId) {
    if (res.isTransferSafe) return true;
    if (res.isSynchronizing) {
      synchronizingModal();
      return false;
    }
    addGuardiansModal({
      wrapClassName,
      className,
      onOk,
      ...props,
    });
    return false;
  }

  // know the chain of operations
  if (originChainId === targetChainId) {
    if (res.isOriginChainSafe) return true;
    addGuardiansModal({ wrapClassName, className, onOk, ...props });
    return false;
  } else {
    if (res.isTransferSafe) return true;
    if (res.isSynchronizing) {
      synchronizingModal();
      return false;
    }
    addGuardiansModal({ wrapClassName, className, onOk, ...props });
    return false;
  }
};

export const addGuardiansModal = ({ wrapClassName, className, onOk, ...props }: AddGuardiansModalProps) => {
  return new Promise((resolve) => {
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: 'portkey-ui-common-modals ' + 'portkey-ui-wallet-security-wrapper ' + wrapClassName,
      className: 'portkey-ui-wallet-security-modal ' + className,
      content: (
        <SecurityCheck
          {...props}
          onCancel={() => {
            resolve(false);
            modal.destroy();
          }}
          onConfirm={() => {
            resolve(true);
            onOk?.();
            modal.destroy();
          }}
        />
      ),
    });
  });
};

export const synchronizingModal = () => {
  return CustomModal({
    type: 'info',
    content: 'Syncing guardian info, which may take 1-2 minutes. Please try again later.',
    okText: 'Ok',
  });
};

export default walletSecurityCheck;
