import React from 'react';
import WalletModal from './WalletModal';
import StyleConfigProvider from '../components/StyleConfigProvider';

export default function Modals() {
  return (
    <StyleConfigProvider>
      <WalletModal />
    </StyleConfigProvider>
  );
}
