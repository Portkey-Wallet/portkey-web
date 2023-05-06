import React, { useEffect, useRef } from 'react';
import { IStorageSuite } from '@portkey/types';
import phoneCountry from './phoneCountry.json';
import { ConfigProvider, SignIn, SignInInterface } from '@portkey/did-ui-react';

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

export default function Sign() {
  useEffect(() => {
    try {
      ConfigProvider.setGlobalConfig({
        storageMethod: myStore,
        socialLogin: {
          Apple: {
            clientId: process.env.NEXT_PUBLIC_APP_APPLE_ID || '',
            redirectURI: 'https://localtest-applesign.portkey.finance/api/app/appleAuth/bingoReceive' || '',
          },
          Google: {
            clientId: process.env.NEXT_PUBLIC_GG_APP_ID || '',
          },
          Portkey: {
            websiteName: 'website demo',
            websiteIcon: '',
          },
        },

        graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
        reCaptchaConfig: {
          siteKey: process.env.NEXT_PUBLIC_GG_RECAPTCHATOKEN_SITE_KEY,
        },
        network: {
          defaultNetwork: 'TESTNET',
          // networkList: [
          //   {
          //     name: 'aelf Testnet',
          //     walletType: 'aelf',
          //     networkType: 'TESTNET',
          //     isActive: true,
          //     apiUrl: 'http://192.168.66.240:15577',
          //     graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
          //     connectUrl: 'http://192.168.66.240:8080',
          //     tokenClaimContractAddress: '2UM9eusxdRyCztbmMZadGXzwgwKfFdk8pF4ckw58D769ehaPSR',
          //   },
          //   {
          //     name: 'aelf Mainnet',
          //     walletType: 'aelf',
          //     networkType: 'MAIN',
          //     isActive: true,
          //     apiUrl: 'https://did-portkey-test.portkey.finance',
          //     graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
          //     connectUrl: 'https://auth-portkey-test.portkey.finance',
          //     tokenClaimContractAddress: '233wFn5JbyD4i8R5Me4cW4z6edfFGRn5bpWnGuY8fjR7b2kRsD',
          //   },
          // ],
        },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const ref = useRef<SignInInterface>();

  return (
    <div>
      <SignIn
        ref={ref}
        uiType="Modal"
        className="sign-in"
        termsOfServiceUrl="https://www.portkey.finance"
        phoneCountry={{
          country: 'any',
          countryList: phoneCountry.countryCode,
        }}
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
