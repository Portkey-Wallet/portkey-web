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
  status: 'Synchronizing' | 'TransferSafe' | 'OriginChainSafe' | 'Cancel' | 'Error';
  message?: string;
}

const syncingTip = 'Syncing guardian info, which may take 1-2 minutes. Please try again later.';

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
      maskClosable: true,
      ...props,
      wrapClassName: wrapClassName,
      className: className,
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
            const isSameChainId = originChainId === targetChainId;

            resolve({
              status: isSameChainId ? 'OriginChainSafe' : 'Synchronizing',
              message: isSameChainId ? 'AddGuardian: OriginChainSafe' : `AddGuardian:${syncingTip}`,
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
