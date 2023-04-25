import { did } from '@portkey/did';
import {
  googleAuthAccessToken,
  ConfigProvider,
  appleAuthIdToken,
  SignUpAndLogin,
  SetPinAndAddManager,
  VerifierSelect,
  CodeVerify,
  GuardianApproval,
  PortkeyQRCode,
  AreaCode,
  PortkeyLoading,
  WakeUpPortkey,
  Unlock,
  CustomSvg,
} from '@portkey/did-ui-react';
import { IStorageSuite } from '@portkey/types';
import { message } from 'antd';
import { useState, useRef, useCallback, useEffect } from 'react';

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
  graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
  socialLogin: {
    Apple: {
      clientId: process.env.NEXT_PUBLIC_APP_APPLE_ID || '',
      redirectURI: 'https://localtest-applesign.portkey.finance/api/app/appleAuth/bingoReceive' || '',
    },
    Google: {
      clientId: process.env.NEXT_PUBLIC_GG_APP_ID || '',
    },
  },
  reCaptchaConfig: {
    siteKey: process.env.NEXT_PUBLIC_GG_RECAPTCHATOKEN_SITE_KEY,
  },
  network: {
    defaultNetwork: 'TESTNET',
    networkList: [
      {
        name: 'aelf Testnet',
        walletType: 'aelf',
        networkType: 'TESTNET',
        isActive: true,
        apiUrl: '',
        graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
        connectUrl: '',
      },
    ],
  },
});

function Example() {
  const [open, setOpen] = useState<boolean>();

  const [isLoading, setLoading] = useState<any>();

  return (
    <div>
      {/* <WakeUpPortkey type="Login" /> */}

      <button
        onClick={async () => {
          const info = await did.services.getChainsInfo();
          console.log(info, '=====info');
        }}>
        get chains info
      </button>
      <PortkeyQRCode value={'value'} logoImage="https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Minerva.png" />

      <PortkeyLoading
        loading={isLoading}
        loadingText={'Synchronizing on-chain account information...'}
        cancelable
        onCancel={() => setLoading(false)}
      />
      {/* <SignIn
        uiType="Modal"
        defaultChainId="tDVV"
        open={open}
        onFinish={didWallet => {
          console.log(didWallet, 'didWallet====onFinish');
        }}
        onChainIdChange={chainId => {
          console.log(chainId, 'chainId====onChainIdChange');
        }}
        onCancel={() => {
          setOpen(false);
        }}
      /> */}

      <button
        onClick={async () => {
          setLoading(true);
        }}>
        ShowLoading
      </button>
      {/* <SignIn
        uiType="Full"
        isShowScan
        // defaultChainId="tDVV"
        open={open}
        onFinish={didWallet => {
          console.log(didWallet, 'didWallet====onFinish');
        }}
        onChainIdChange={chainId => {
          console.log(chainId, 'chainId====onChainIdChange');
        }}
        onCancel={() => {
          setOpen(false);
        }}
      /> */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <SignUpAndLogin
          phoneCountry={{ country: 'any', countryList: [{ code: '56', country: 'any' }] }}
          style={{ height: 600 }}
          termsOfServiceUrl={'termsOfServiceUrl'}
          socialLogin={{
            Apple: {
              clientId: process.env.NEXT_PUBLIC_APP_APPLE_ID || '',
              redirectURI: process.env.NEXT_PUBLIC_APP_APPLE_REDIRECT_URI || '',
            },
            Google: {
              clientId: process.env.NEXT_PUBLIC_GG_APP_ID || '',
            },
            Portkey: {
              websiteName: 'website demo name',
              websiteIcon: '',
            },
          }}
          // // socialLogin porps
          // socialLogin?: ISocialLoginConfig;
          // //
          onError={(error: any) => {
            console.log(error, 'onError');
          }}
          onSuccess={(value: any) => {
            console.log(value, 'onSuccess');
          }}
          // onNetworkChange?: (network: string) => void;
          // onChainIdChange?: (value?: ChainId) => void;
        />
        <VerifierSelect
          //  verifierList?: VerifierItem[];
          //  defaultVerifier?: string;
          guardianIdentifier={'105383420233267798964'}
          //  className?: string;
          accountType={'Google'}
          //  isErrorTip?: boolean;
          onError={(error: any) => {
            console.log(error, 'onError VerifierSelect===');
          }}
          onConfirm={result => {
            console.log(result, 'onConfirm VerifierSelect===');
          }}
        />
        <SetPinAndAddManager
          guardianApprovedList={[]}
          type={'recovery'}
          guardianIdentifier={'105383420233267798964'}
          onError={(error: any) => {
            console.log(error, 'onError SetPinAndAddManager===');
          }}
          onFinish={result => {
            console.log(result, 'onConfirm SetPinAndAddManager===');
          }}
        />
        <CodeVerify
          chainId="AELF"
          isErrorTip
          accountType="Phone"
          verifier={{
            endPoints: ['http://192.168.66.240:16010'],
            verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
            id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
            name: 'Portkey',
            imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
          }}
          verifierSessionId={'080bbdcd-73f5-45a6-b65b-0d067474756f'}
          guardianIdentifier={'+852 12233333'}
          onError={(error: any) => {
            console.log(error, 'onError SetPinAndAddManager===');
          }}
          onSuccess={result => {
            console.log(result, 'onConfirm SetPinAndAddManager===');
          }}
        />
        <GuardianApproval
          chainId="AELF"
          guardianList={[
            {
              isLoginAccount: true,
              verifier: {
                endPoints: ['http://192.168.66.240:16010'],
                verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
                id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
                name: 'Portkey',
                imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
              },
              identifier: 'identifier',
              guardianType: 'Phone',
              key: '',
            },
          ]}
        />
        <Unlock
          uiType="Full"
          value={'value'}
          onChange={e => {
            //
          }}
          onUnlock={() => {
            //
          }}
        />
      </div>
    </div>
  );
}

export default Example;
