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

let AddGuardiansModalInstance: ReturnType<typeof BaseModalFunc> | null;
let prevWrapClsx: string;
let prevClsx: string;

export const addGuardiansModal = ({ wrapClassName = '', className = '', onOk, ...props }: AddGuardiansModalProps) => {
  return new Promise((resolve) => {
    const modalConfig = {
      ...props,
      wrapClassName: 'portkey-ui-wallet-security-wrapper' + wrapClassName,
      className: 'portkey-ui-wallet-security-modal' + className,
      content: (
        <SecurityCheck
          {...props}
          onCancel={() => {
            resolve(false);
            AddGuardiansModalInstance!.destroy();
            AddGuardiansModalInstance = null;
          }}
          onConfirm={() => {
            resolve(true);
            onOk?.();
            AddGuardiansModalInstance!.destroy();
            AddGuardiansModalInstance = null;
          }}
        />
      ),
    };
    if (AddGuardiansModalInstance) {
      AddGuardiansModalInstance.update((prevConfig) => {
        return {
          ...prevConfig,
          ...modalConfig,
          className: prevConfig.className?.replace(prevClsx, className),
          wrapClassName: prevConfig.wrapClassName?.replace(prevWrapClsx, wrapClassName),
        };
      });
      prevWrapClsx = wrapClassName;
      prevClsx = className;
    } else {
      prevWrapClsx = wrapClassName;
      prevClsx = className;
      AddGuardiansModalInstance = BaseModalFunc(modalConfig);
    }
  });
};

let SynchronizingModalInstance: ReturnType<typeof BaseModalFunc> | null;

export const synchronizingModal = () => {
  if (SynchronizingModalInstance) {
    SynchronizingModalInstance.update((prevConfig) => {
      return {
        ...prevConfig,
        ...{
          type: 'info',
          content: 'Syncing guardian info, which may take 1-2 minutes. Please try again later.',
          okText: 'Ok',
        },
      };
    });
  } else {
    return (SynchronizingModalInstance = CustomModal({
      type: 'info',
      content: 'Syncing guardian info, which may take 1-2 minutes. Please try again later.',
      okText: 'Ok',
    }));
  }
};

export default walletSecurityCheck;
