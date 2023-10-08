import BaseModalFunc from '../BaseModalMethod';
import { did } from '../../../utils';
import SecurityCheck from '../../SecurityCheck';

interface WalletSecurityCheckModalProps {
  wrapClassName?: string;
  className?: string;
  caHash: string;
  onOk?: () => void;
}

const walletSecurityCheck = async ({
  wrapClassName,
  caHash,
  className,
  onOk,
  ...props
}: WalletSecurityCheckModalProps) => {
  const result = await did.services.security.getWalletBalanceCheck({ caHash });
  if (!result.isSafe) {
    new Promise((resolve) => {
      const modal = BaseModalFunc({
        ...props,
        wrapClassName: 'portkey-ui-common-modals ' + 'portkey-ui-wallet-security-wrapper ' + wrapClassName,
        className: 'portkey-ui-h-335 portkey-ui-wallet-security-modal ' + className,
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
  }

  return result.isSafe;
};

export default walletSecurityCheck;
