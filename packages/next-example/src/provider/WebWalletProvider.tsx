'use client';
import { PortkeyWebWalletProvider } from '@portkey/connect-web-wallet';
import React from 'react';

export default function WebWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <PortkeyWebWalletProvider
      options={{
        networkType: 'TESTNET',
        theme: 'light',
        appId: 'wallet-appId',
      }}>
      {children}
    </PortkeyWebWalletProvider>
  );
}
