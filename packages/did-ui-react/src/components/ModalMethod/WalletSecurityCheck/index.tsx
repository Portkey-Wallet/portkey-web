import BaseModalFunc from '../BaseModalMethod';
import { did, setLoading, checkAccelerate } from '../../../utils';
import SecurityCheck from '../../SecurityCheck';
import SecurityCheckAndAccelerate from '../../SecurityCheckAndAccelerate';
import { ChainId } from '@portkey/types';
import { IWalletBalanceCheckResponse, IAccelerateGuardian } from '@portkey/services';

interface WalletSecurityCheckModalProps extends AddGuardiansModalProps {
  caHash: string;
  originChainId: ChainId;
  targetChainId: ChainId;
}

interface AddGuardiansModalProps {
  wrapClassName?: string;
  className?: string;
  onOk?: () => void;
}

interface SyncAccelerateModalProps {
  wrapClassName?: string;
  className?: string;
  accelerateGuardianTxId?: string;
  accelerateChainId: ChainId;
  originChainId: ChainId;
  caHash: string;
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
  const res: IWalletBalanceCheckResponse = await did.services.security.getWalletBalanceCheck({
    caHash,
    checkTransferSafeChainId: targetChainId,
  });

  if (res.isTransferSafe) return true;

  if (originChainId === targetChainId) {
    if (res.isOriginChainSafe) return true;
    addGuardiansModal({ wrapClassName, className, onOk, ...props });
    return false;
  } else {
    if (res.isSynchronizing && res.isOriginChainSafe) {
      let accelerateGuardianTxId = '';
      if (Array.isArray(res.accelerateGuardians)) {
        const _accelerateGuardian = res.accelerateGuardians.find(
          (item: IAccelerateGuardian) => item.transactionId && item.chainId === originChainId,
        );
        if (_accelerateGuardian) {
          accelerateGuardianTxId = _accelerateGuardian.transactionId;
        }
      }
      syncAccelerateModal({
        wrapClassName,
        className,
        accelerateChainId: targetChainId,
        caHash,
        originChainId,
        accelerateGuardianTxId,
        ...props,
      });
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
    const onCancel = () => {
      resolve(false);
      AddGuardiansModalInstance!.destroy();
      AddGuardiansModalInstance = null;
    };
    const modalConfig = {
      ...props,
      wrapClassName: 'portkey-ui-wallet-security-wrapper' + wrapClassName,
      className: 'portkey-ui-wallet-security-modal' + className,
      oncancel: onCancel,
      content: (
        <SecurityCheck
          {...props}
          onCancel={onCancel}
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

let SyncAccelerateModalInstance: ReturnType<typeof BaseModalFunc> | null;
let syncPrevWrapClsx: string;
let syncPrevClsx: string;

export const syncAccelerateModal = async ({
  accelerateGuardianTxId,
  caHash,
  accelerateChainId,
  originChainId,
  wrapClassName = '',
  className = '',
  ...props
}: SyncAccelerateModalProps) => {
  const checkAccelerateIsReady = async () => {
    setLoading(true);
    await checkAccelerate({
      accelerateGuardianTxId,
      originChainId,
      accelerateChainId,
      caHash,
    });
    setLoading(false);
  };

  return new Promise((resolve) => {
    const oncancel = () => {
      resolve(false);
      SyncAccelerateModalInstance!.destroy();
      SyncAccelerateModalInstance = null;
    };
    const modalConfig = {
      ...props,
      wrapClassName: 'portkey-ui-wallet-security-wrapper' + wrapClassName,
      className: 'portkey-ui-wallet-security-modal' + className,
      oncancel,
      content: (
        <SecurityCheckAndAccelerate
          {...props}
          onClose={oncancel}
          onConfirm={async () => {
            resolve(true);
            SyncAccelerateModalInstance!.destroy();
            SyncAccelerateModalInstance = null;
            await checkAccelerateIsReady();
          }}
        />
      ),
    };
    if (SyncAccelerateModalInstance) {
      SyncAccelerateModalInstance.update((prevConfig) => {
        return {
          ...prevConfig,
          ...modalConfig,
          className: prevConfig.className?.replace(syncPrevClsx, className),
          wrapClassName: prevConfig.wrapClassName?.replace(syncPrevWrapClsx, wrapClassName),
        };
      });
      syncPrevWrapClsx = wrapClassName;
      syncPrevClsx = className;
    } else {
      syncPrevWrapClsx = wrapClassName;
      syncPrevClsx = className;
      SyncAccelerateModalInstance = BaseModalFunc(modalConfig);
    }
  });
};

export default walletSecurityCheck;
