import { useMemo } from 'react';
import { IMenuItemType } from '../types';

interface useMyMenuListProps {
  onClickGuardians: () => void;
  onClickTransactionLimits: () => void;
  onClickTokenAllowances: () => void;
  onClickBackupEmail: () => void;
}

export function useMyMenuList({
  onClickGuardians,
  onClickTransactionLimits,
  onClickTokenAllowances,
  onClickBackupEmail,
}: useMyMenuListProps): IMenuItemType[] {
  return useMemo(
    () => [
      {
        label: 'Guardians',
        icon: 'MyGuardians',
        onClick: onClickGuardians,
      },
      {
        label: 'Transaction limits',
        icon: 'MyTransactionLimit',
        onClick: onClickTransactionLimits,
      },
      {
        label: 'Token allowances',
        icon: 'MyTokenAllowance',
        onClick: onClickTokenAllowances,
      },
      {
        label: 'Backup email',
        icon: 'MyMailThin',
        onClick: onClickBackupEmail,
      },
    ],
    [onClickBackupEmail, onClickGuardians, onClickTokenAllowances, onClickTransactionLimits],
  );
}

interface useWalletSecurityMenuListProps {
  onClickPaymentSecurity: () => void;
  onClickTokenAllowance: () => void;
  onClickSetSecondaryMailbox: () => void;
}

export function useWalletSecurityMenuList({
  onClickPaymentSecurity,
  onClickTokenAllowance,
  onClickSetSecondaryMailbox,
}: useWalletSecurityMenuListProps): IMenuItemType[] {
  return useMemo(
    () => [
      {
        label: 'Payment Security',
        onClick: onClickPaymentSecurity,
      },
      {
        label: 'Token Allowance',
        onClick: onClickTokenAllowance,
      },
      {
        label: 'Set up Backup Mailbox',
        onClick: onClickSetSecondaryMailbox,
      },
    ],
    [onClickPaymentSecurity, onClickSetSecondaryMailbox, onClickTokenAllowance],
  );
}
