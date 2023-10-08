import { useMemo } from 'react';
import { IMenuItemType } from '../types';

interface useMyMenuListProps {
  onClickGuardians: () => void;
  onClickWalletSecurity: () => void;
}

export function useMyMenuList({ onClickGuardians, onClickWalletSecurity }: useMyMenuListProps): IMenuItemType[] {
  return useMemo(
    () => [
      {
        label: 'Guardians',
        icon: 'Guardians',
        onClick: onClickGuardians,
      },
      {
        label: 'Wallet Security',
        icon: 'WalletSecurity',
        onClick: onClickWalletSecurity,
      },
    ],
    [onClickGuardians, onClickWalletSecurity],
  );
}

interface useWalletSecurityMenuListProps {
  onClickPaymentSecurity: () => void;
}

export function useWalletSecurityMenuList({ onClickPaymentSecurity }: useWalletSecurityMenuListProps): IMenuItemType[] {
  return useMemo(
    () => [
      {
        label: 'Payment Security',
        onClick: onClickPaymentSecurity,
      },
    ],
    [onClickPaymentSecurity],
  );
}
