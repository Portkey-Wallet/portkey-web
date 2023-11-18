import BaseModalFunc from '../BaseModalMethod';
import CheckWalletSecurityInner, { BaseCheckWalletSecurityInnerProps } from '../../CheckWalletSecurityInner';
import { CheckSecurityResult, checkAccelerate, did, handleErrorMessage, setLoading } from '../../../utils';
import { ChainId } from '@portkey/types';
import SecurityCheckAndAccelerate from '../../SecurityCheckAndAccelerate';
interface BaseCheckWalletSecurityProps {
  wrapClassName?: string;
  className?: string;
  targetChainId: ChainId;
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
  const res: CheckSecurityResult = await did.services.security.getWalletBalanceCheck({
    caHash,
    checkTransferSafeChainId: targetChainId,
  });

  const checkAccelerateIsReady = async () => {
    setLoading(true);
    let accelerateGuardianTxId;
    if (Array.isArray(res.accelerateGuardians)) {
      const _accelerateGuardian = res.accelerateGuardians.find(
        (item) => item.transactionId && item.chainId === originChainId,
      );
      accelerateGuardianTxId = _accelerateGuardian?.transactionId || '';
    }
    await checkAccelerate({
      accelerateGuardianTxId,
      originChainId,
      accelerateChainId: targetChainId,
      caHash,
    });
    setLoading(false);
  };

  if (res.isTransferSafe) return { status: 'TransferSafe' };

  if (originChainId === targetChainId) {
    if (res.isOriginChainSafe) return { status: 'OriginChainSafe' };
  } else {
    if (res.isSynchronizing && res.isOriginChainSafe)
      return new Promise((resolve) => {
        const modal = BaseModalFunc({
          maskClosable: true,
          ...props,
          wrapClassName: wrapClassName,
          className: className,
          content: (
            <SecurityCheckAndAccelerate
              {...props}
              onClose={() => {
                resolve({
                  status: 'Synchronizing',
                  message: syncingTip,
                });
                modal.destroy();
              }}
              onConfirm={async () => {
                modal.destroy();
                await checkAccelerateIsReady();
                resolve({ status: 'TransferSafe' });
              }}
            />
          ),
        });
      });
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
          targetChainId={targetChainId}
          originChainId={originChainId}
          {...props}
          onCancel={() => {
            resolve({
              status: 'Cancel',
              message: 'User Cancel',
            });
            modal.destroy();
          }}
          onFinish={({ syncRes }) => {
            let _res: CheckWalletSecurityResult = {
              status: 'TransferSafe',
              message: 'AddGuardian: CurrentChainSafe',
            };
            if (originChainId !== targetChainId && !syncRes) {
              _res = {
                status: 'Synchronizing',
                message: `AddGuardian:${syncingTip}`,
              };
            }
            resolve(_res);
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
