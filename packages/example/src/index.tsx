import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { did } from '@portkey/did';
import { IStorageSuite } from '@portkey/types';
import { SignIn } from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';

export class Store implements IStorageSuite {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
}

const myStore = new Store();

did.setConfig({
  graphQLUrl: 'http://192.168.67.84:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
  storageMethod: myStore,
});

function App() {
  const [open, setOpen] = useState<boolean>();
  return (
    <div>
      did example
      <button
        onClick={async () => {
          const info = await did.services.getChainsInfo();
          console.log(info, '=====info');
        }}>
        get chains info
      </button>
      <button
        onClick={async () => {
          const wallet = did.create();
          console.log(wallet, '=====wallet');
        }}>
        create
      </button>
      <button
        onClick={async () => {
          console.log(did.didWallet.managementAccount);

          const wallet = await did.save('111111');
          console.log(wallet, '=====wallet');
        }}>
        save
      </button>
      <button
        onClick={async () => {
          const wallet = await did.load('111111');
          console.log(wallet, '=====wallet');
        }}>
        load
      </button>
      <button
        onClick={async () => {
          console.log(did.didWallet.managementAccount);
        }}>
        managerAccount
      </button>
      <button
        onClick={() => {
          setOpen(v => !v);
        }}>
        @portkey/did-ui-react
      </button>
      <SignIn
        open={open}
        onFinish={didWallet => {
          console.log(didWallet, 'didWallet====onFinish');
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
  );
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
