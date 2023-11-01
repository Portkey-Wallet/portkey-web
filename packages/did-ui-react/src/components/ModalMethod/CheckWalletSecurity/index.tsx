import BaseModalFunc from '../BaseModalMethod';
import CheckWalletSecurityInner, { BaseCheckWalletSecurityInnerProps } from '../../CheckWalletSecurityInner';
import { did, handleErrorMessage } from '../../../utils';
import { ChainId } from '@portkey/types';
interface BaseCheckWalletSecurityProps {
  wrapClassName?: string;
  className?: string;
  targetChainId?: ChainId;
}

export type CheckWalletSecurityProps = BaseCheckWalletSecurityInnerProps & BaseCheckWalletSecurityProps;

export interface CheckWalletSecurityResult {
  status: 'Synchronizing' | 'TransferSafe' | 'OriginChainSafe' | 'AddGuardian' | 'Cancel' | 'Error';
  message?: string;
}

const syncingTip = 'Syncing guardian info, which may take 1-2 minutes. Please try again later.';
const justAddedTip = 'Just added guardian';

const walletSecurityCheck = async ({
  wrapClassName = '',
  className = '',
  caHash,
  targetChainId,
  originChainId,
  ...props
}: CheckWalletSecurityProps): Promise<CheckWalletSecurityResult> => {
  const res = await did.services.security.getWalletBalanceCheck({ caHash });

  if (!targetChainId) {
    if (res.isTransferSafe) return { status: 'TransferSafe' };
    if (res.isSynchronizing)
      return {
        status: 'Synchronizing',
        message: syncingTip,
      };
  }

  // know the chain of operations
  if (originChainId === targetChainId) {
    if (res.isOriginChainSafe) return { status: 'OriginChainSafe' };
    // TODO addGuardians
    // addGuardiansModal({ wrapClassName, className, onOk, ...props });
    // return false;
  } else {
    if (res.isTransferSafe) return { status: 'TransferSafe' };
    if (res.isSynchronizing)
      return {
        status: 'Synchronizing',
        message: syncingTip,
      };
  }

  return new Promise((resolve) => {
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: wrapClassName,
      className: 'portkey-ui-h-566 ' + className,
      content: (
        <CheckWalletSecurityInner
          caHash={caHash}
          originChainId={originChainId}
          {...props}
          onCancel={() => {
            resolve({
              status: 'Cancel',
              message: 'User Cancel',
            });
            modal.destroy();
          }}
          onFinish={() => {
            resolve({
              status: 'AddGuardian',
              message: originChainId !== targetChainId ? syncingTip : justAddedTip,
            });
            modal.destroy();
          }}
          onError={(error) => {
            resolve({
              status: 'Error',
              message: handleErrorMessage(error),
            });
            modal.destroy();
          }}
        />
      ),
    });
  });
};

export default walletSecurityCheck;
