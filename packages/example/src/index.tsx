import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { did } from '@portkey/did';
import { IStorageSuite } from '@portkey/types';
import { ConfigProvider, SignIn, ISignIn } from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';
import { getContractBasic } from '@portkey/contracts';
import AElf from 'aelf-sdk';

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

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  socialLogin: {
    Portkey: {
      websiteName: 'website demo',
      websiteIcon: '',
    },
  },

  graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
  network: {
    defaultNetwork: 'TESTNET',
  },
});

function App() {
  const ref = useRef<ISignIn>();
  return (
    <div>
      did example
      <button
        onClick={async () => {
          const account = AElf.wallet.getWalletByPrivateKey(
            'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71',
          );
          const contract = await getContractBasic({
            contractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
            rpcUrl: 'https://explorer-test.aelf.io/chain',
            account,
          });
          const req = await contract.callViewMethod<{ balance: string; owner: string; symbol: string }>('GetBalance', {
            symbol: 'ELF',
            owner: account.address,
          });
          console.log(req.data.balance, '=====req');
          const transfer1 = await contract.callSendMethod('Transfer', '', {
            symbol: 'ELF',
            to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
            amount: 10000 * 10 ** 8,
          });
          console.log(transfer1, '=====transfer1');
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
      <SignIn
        ref={ref}
        uiType="Modal"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://www.portkey.finance'}
        onFinish={res => {
          console.log(res, 'onFinish====');
        }}
        onError={error => {
          console.log(error, 'onError====error');
        }}
        onCancel={() => {
          ref?.current.setOpen(false);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
      />
      <button
        onClick={() => {
          ref?.current.setOpen(true);
        }}>
        setOpen
      </button>
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
