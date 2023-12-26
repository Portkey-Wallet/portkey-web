import BaseModalFunc from '../BaseModalMethod';
import CheckWalletSecurityInner, { BaseCheckWalletSecurityInnerProps } from '../../CheckWalletSecurityInner';
import { CheckSecurityResult, checkAccelerate, did, handleErrorMessage, setLoading } from '../../../utils';
import { ChainId } from '@portkey-v1/types';
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

  const checkAccelerateIsReady = async (): Promise<boolean> => {
    setLoading(true);
    let accelerateGuardianTxId;
    if (Array.isArray(res.accelerateGuardians)) {
      const _accelerateGuardian = res.accelerateGuardians.find(
        (item) => item.transactionId && item.chainId === originChainId,
      );
      accelerateGuardianTxId = _accelerateGuardian?.transactionId || '';
    }
    const accelerateRes = await checkAccelerate({
      accelerateGuardianTxId,
      originChainId,
      accelerateChainId: targetChainId,
      caHash,
    });
    setLoading(false);
    return accelerateRes;
  };

  if (res.isTransferSafe) return { status: 'TransferSafe' };

  if (originChainId === targetChainId) {
    if (res.isOriginChainSafe) return { status: 'OriginChainSafe' };
  } else {
    if (res.isSynchronizing && res.isOriginChainSafe)
      return new Promise((resolve) => {
        const onCancel = () => {
          resolve({
            status: 'Synchronizing',
            message: syncingTip,
          });
          modal.destroy();
        };
        const modal = BaseModalFunc({
          maskClosable: true,
          ...props,
          wrapClassName,
          className,
          onCancel,
          content: (
            <SecurityCheckAndAccelerate
              {...props}
              onClose={onCancel}
              onConfirm={async () => {
                modal.destroy();
                const isAccelerate = await checkAccelerateIsReady();
                const res: CheckWalletSecurityResult = isAccelerate
                  ? { status: 'TransferSafe' }
                  : {
                      status: 'Synchronizing',
                      message: syncingTip,
                    };
                resolve(res);
              }}
            />
          ),
        });
      });
  }

  return new Promise((resolve) => {
    const onCancel = () => {
      resolve({
        status: 'Cancel',
        message: 'User Cancel',
      });
      modal.destroy();
    };
    const modal = BaseModalFunc({
      maskClosable: true,
      ...props,
      wrapClassName,
      className,
      onCancel,
      content: (
        <CheckWalletSecurityInner
          caHash={caHash}
          targetChainId={targetChainId}
          originChainId={originChainId}
          {...props}
          onCancel={onCancel}
          onFinish={({ syncStatus }) => {
            let _res: CheckWalletSecurityResult = {
              status: 'TransferSafe',
              message: 'AddGuardian: CurrentChainSafe',
            };
            if (originChainId !== targetChainId && !syncStatus) {
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
